"use strict";
// CLASH LARA V10.4 - GM invite service; Node 22+, zero external deps.
const http=require('node:http'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const PORT=Number(process.env.GM_PORT||8788), HOST=process.env.GM_HOST||'127.0.0.1';
const DB=path.resolve(process.env.GM_DB||path.join(__dirname,'.gm_private.json'));
const ROOT_PASSWORD=process.env.CLASH_GM_PASSWORD;
const ROOT_NAME=process.env.CLASH_GM_USERNAME||'gm';
if(!ROOT_PASSWORD||ROOT_PASSWORD.length<16){console.error('Configure CLASH_GM_PASSWORD (minimo 16 caracteres).');process.exit(1)}
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const passwordHash=(password,salt)=>crypto.scryptSync(password,salt,64).toString('hex');
const safeEqual=(a,b)=>{const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&crypto.timingSafeEqual(x,y)};
let db={users:[],invites:[],sessions:[],audit:[]};
if(fs.existsSync(DB)){db=JSON.parse(fs.readFileSync(DB,'utf8'))}
function save(){const tmp=DB+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db),{mode:0o600});fs.renameSync(tmp,DB);try{fs.chmodSync(DB,0o600)}catch{}}
const now=()=>Date.now();
if(!db.users.some(u=>u.role==='gm')){const salt=crypto.randomBytes(16).toString('hex');db.users.push({id:crypto.randomUUID(),name:ROOT_NAME,role:'gm',salt,pass:passwordHash(ROOT_PASSWORD,salt),created:now()});save()}
const attempts=new Map();
function limited(req){const ip=req.socket.remoteAddress||'unknown',t=now(),a=(attempts.get(ip)||[]).filter(x=>t-x<60000);a.push(t);attempts.set(ip,a);return a.length>40}
function send(res,status,obj){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','access-control-allow-origin':'none'});res.end(JSON.stringify(obj))}
function auth(req){const token=(req.headers.authorization||'').match(/^Bearer ([a-f0-9]{64})$/)?.[1];if(!token)return null;const s=db.sessions.find(s=>s.hash===sha(token)&&s.expires>now());return s?db.users.find(u=>u.id===s.userId):null}
function issueSession(u){const token=crypto.randomBytes(32).toString('hex');db.sessions.push({hash:sha(token),userId:u.id,expires:now()+8*3600e3});save();return token}
async function body(req){let buf='';for await(const c of req){buf+=c;if(buf.length>8192)throw Error('too_large')}return JSON.parse(buf||'{}')}
const username=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{3,24}$/.test(x);
const password=x=>typeof x==='string'&&x.length>=12&&x.length<=128;
const audit=(action,user,details)=>{db.audit.push({at:now(),action,actor:user?.id||null,details});if(db.audit.length>2000)db.audit=db.audit.slice(-2000)};
const app=http.createServer(async(req,res)=>{
 try{
  if(req.method==='GET'&&req.url==='/api/gm/time')return send(res,200,{serverTime:now()});
  if(req.method!=='POST')return send(res,404,{error:'not_found'});
  if(limited(req))return send(res,429,{error:'rate_limited'});
  const x=await body(req);
  if(req.url==='/api/gm/login'){
    const u=db.users.find(u=>u.name===x.username),dummy='0'.repeat(128);
    const check=u?passwordHash(x.password||'',u.salt):dummy;
    if(!u||!safeEqual(check,u.pass))return send(res,401,{error:'invalid_credentials'});
    audit('login',u,{});save();return send(res,200,{token:issueSession(u),role:u.role,username:u.name});
  }
  if(req.url==='/api/gm/register'){
    if(!username(x.username)||!password(x.password)||typeof x.code!=='string')return send(res,400,{error:'invalid_input'});
    const entry=db.invites.find(i=>i.hash===sha(x.code)&&!i.used&&i.expires>now()&&i.role==='player');
    if(!entry)return send(res,403,{error:'invalid_or_expired_code'});
    if(db.users.some(u=>u.name.toLowerCase()===x.username.toLowerCase()))return send(res,409,{error:'username_taken'});
    const salt=crypto.randomBytes(16).toString('hex');const u={id:crypto.randomUUID(),name:x.username,role:'player',salt,pass:passwordHash(x.password,salt),created:now()};
    entry.used=now();entry.usedBy=u.id;db.users.push(u);audit('register',u,{inviteId:entry.id});save();return send(res,201,{created:true,username:u.name,role:'player'});
  }
  const u=auth(req);if(!u)return send(res,401,{error:'unauthorized'});
  if(req.url==='/api/gm/me')return send(res,200,{username:u.name,role:u.role});
  if(u.role!=='gm')return send(res,403,{error:'gm_only'});
  if(req.url==='/api/gm/invites'){
    const ttl=Number(x.hours||24),count=Number(x.count||1);
    if(!Number.isInteger(ttl)||ttl<1||ttl>720||!Number.isInteger(count)||count<1||count>20)return send(res,400,{error:'invalid_limits'});
    const codes=[];for(let i=0;i<count;i++){const code='CL-'+crypto.randomBytes(18).toString('base64url');db.invites.push({id:crypto.randomUUID(),hash:sha(code),role:'player',createdBy:u.id,created:now(),expires:now()+ttl*3600000,used:null});codes.push(code)}
    audit('issue_invites',u,{count,ttl});save();return send(res,201,{codes,expiresInHours:ttl,warning:'Mostrados apenas uma vez'});
  }
  if(req.url==='/api/gm/revoke'){
    const entry=db.invites.find(i=>i.id===x.id&&!i.used);if(!entry)return send(res,404,{error:'invite_not_found'});
    entry.expires=0;audit('revoke_invite',u,{id:entry.id});save();return send(res,200,{revoked:true});
  }
  if(req.url==='/api/gm/list')return send(res,200,{users:db.users.map(z=>({id:z.id,name:z.name,role:z.role})),invites:db.invites.map(i=>({id:i.id,used:!!i.used,expires:i.expires}))});
  return send(res,404,{error:'not_found'});
 }catch(e){return send(res,e.message==='too_large'?413:400,{error:'bad_request'})}
});
app.listen(PORT,HOST,()=>console.log(`GM access service on http://${HOST}:${PORT} (LOCAL DEVELOPMENT ONLY)`));
