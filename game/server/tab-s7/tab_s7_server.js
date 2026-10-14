"use strict";
// V10.5 unified alpha service. LAN only, no public exposure without HTTPS reverse proxy.
const http=require('node:http'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const Core=require('./trainer_core');
const os=require('node:os');
const {monitorEventLoopDelay}=require('node:perf_hooks');
const loop=monitorEventLoopDelay({resolution:40});loop.enable();
let prevCpu=process.cpuUsage(),prevCpuAt=performance.now();
function hostVitals(){const now=performance.now(),delta=process.cpuUsage(prevCpu),dt=Math.max(1,now-prevCpuAt);prevCpu=process.cpuUsage();prevCpuAt=now;const mem=process.memoryUsage();const lag=Number.isFinite(loop.mean)?Math.round(loop.mean/1e6):null;loop.reset();return {processRssMb:Math.round(mem.rss/1048576),heapUsedMb:Math.round(mem.heapUsed/1048576),systemFreeMb:Math.round(os.freemem()/1048576),systemTotalMb:Math.round(os.totalmem()/1048576),processCpuPercent:Math.min(100,Math.round((delta.user+delta.system)/1000/dt*100)),eventLoopLagMs:lag,uptimeSeconds:Math.floor(process.uptime()),warning:mem.rss>256*1048576||lag>120?'resource_pressure':'none',sample:'process metrics only; CPU percent is per elapsed wall time'};}
const HOST=process.env.HOST||'127.0.0.1',PORT=Number(process.env.PORT||8787),FILE=path.resolve(process.env.CLASH_DB||path.join(__dirname,'.clash_private.json'));
const GM=process.env.CLASH_GM_PASSWORD,GM_NAME=process.env.CLASH_GM_USERNAME||'gm';
const MAX_USERS=Number(process.env.CLASH_MAX_USERS||1000);
const MAX_DB_BYTES=Number(process.env.CLASH_MAX_DB_BYTES||8*1024*1024);
if(!Number.isSafeInteger(MAX_DB_BYTES)||MAX_DB_BYTES<65536||MAX_DB_BYTES>128*1024*1024)throw Error('Invalid CLASH_MAX_DB_BYTES');
if(!Number.isSafeInteger(MAX_USERS)||MAX_USERS<1||MAX_USERS>100000)throw Error('Invalid CLASH_MAX_USERS');
if(!GM||GM.length<16)throw Error('Set CLASH_GM_PASSWORD with at least 16 characters');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const pw=(p,s)=>crypto.scryptSync(p,s,64).toString('hex');
const equal=(a,b)=>{let x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const {Store}=require('./sqlite-store');
const store=new Store(FILE,MAX_DB_BYTES);
let db=store.load();
db.sessions=[];
function save(){store.save(db)}
if(!db.users.some(x=>x.role==='gm')){const salt=crypto.randomBytes(16).toString('hex');db.users.push({id:crypto.randomUUID(),name:GM_NAME,role:'gm',salt,pass:pw(GM,salt)});save()}
// One-time monotonic runtime baseline. On restart sessions are paused; no catch-up credit.
const startWall=Date.now(),startMono=performance.now();let lastWall=startWall;
function clock(){const wall=Date.now(),monotonic=startWall+(performance.now()-startMono);if(Math.abs(wall-monotonic)>30000)throw Error('Host clock drift detected: training suspended');lastWall=wall;return Math.floor(monotonic)}
// A boot or process restart never credits downtime: per-user trainer state is persisted with active:null.
for(const key of Object.keys(db.trainer)){db.trainer[key]=Core.normalize(db.trainer[key],startWall);db.trainer[key].active=null;db.trainer[key].lastSync=startWall}save();
const attempts=new Map();const loginFailures=new Map();
function loginBlocked(ip,name){const k=ip+'|'+name.toLowerCase(),a=loginFailures.get(k);if(!a)return false;if(performance.now()-a.last>15*60000){loginFailures.delete(k);return false}return a.n>=3&&a.until>performance.now()}
function loginFailure(ip,name){const k=ip+'|'+name.toLowerCase(),a=loginFailures.get(k)||{n:0,until:0};a.n++;a.last=performance.now();a.until=a.n<3?performance.now():performance.now()+Math.min(15*60000,1000*2**Math.min(a.n-2,10));loginFailures.set(k,a);if(loginFailures.size>4096){for(const [key,v] of loginFailures){if(v.until<=performance.now())loginFailures.delete(key)}if(loginFailures.size>4096)loginFailures.clear()}}
function limited(req){const ip=req.socket.remoteAddress||'',t=performance.now();if(attempts.size>4096){for(const [key,a] of attempts){if(!a.length||t-a[a.length-1]>60000)attempts.delete(key)}if(attempts.size>4096)attempts.clear()}const arr=(attempts.get(ip)||[]).filter(n=>t-n<60000);arr.push(t);attempts.set(ip,arr);return arr.length>30}
function send(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-frame-options':'DENY','content-security-policy':"default-src 'none'; frame-ancestors 'none'"});res.end(JSON.stringify(data))}
async function body(req){if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw Error('unsupported_media_type');const declared=Number(req.headers['content-length']);if(req.headers['content-length']!==undefined&&(!Number.isSafeInteger(declared)||declared<0||declared>8192))throw Error('payload_too_large');let chunks=[],bytes=0;for await(const b of req){bytes+=b.length;if(bytes>8192)throw Error('payload_too_large');chunks.push(b)}try{const obj=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('bad_json');return obj}catch{throw Error('bad_json')}}
function auth(req,t){const token=/^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization||'')?.[1];if(!token)return null;const session=db.sessions.find(s=>s.hash===hash(token)&&s.expires>t);return session?db.users.find(u=>u.id===session.userId):null}
function audit(action,u){db.audit.push({action,at:Date.now(),actor:u?.id||null});if(db.audit.length>1000)db.audit=db.audit.slice(-1000)}
function getTrainer(u,t){if(!db.trainer[u.id])db.trainer[u.id]=Core.create(t);return db.trainer[u.id]}
const username=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{3,24}$/.test(x);
const validPassword=x=>typeof x==='string'&&x.length>=12&&x.length<=128;
async function handle(req,res){const snapshot=req.method==='POST'?structuredClone(db):null;try{
 const t=clock(),url=new URL(req.url,'http://localhost').pathname.replace(/^\/api\/v1\//,'/api/');
 if(req.method==='GET'&&url==='/api/host-vitals')return send(res,200,{ok:true,host:hostVitals(),policy:'lmcp-s1-host-health-1',note:'Public endpoint: no secrets, account data or tokens'});
 if(req.method==='GET'&&url==='/api/health')return send(res,200,{ok:true,uptimeSeconds:Math.floor((performance.now()-startMono)/1000),timeMs:t,clock:'host monotonic anchored; NOT externally attested',policyVersion:'lmcp-s1-1.0',dbBytes:fs.statSync(store.file).size});
 if(req.method==='GET'&&url==='/api/time')return send(res,200,{timeMs:t,clock:'host monotonic anchored; NOT externally attested'});
 if(req.method==='GET'&&url==='/host-health'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});return fs.createReadStream(path.join(__dirname,'host_health.html')).pipe(res)}
 if(req.method==='GET'&&url==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return fs.createReadStream(path.join(__dirname,'tab_s7_panel.html')).pipe(res)}
 if(req.method!=='POST')return send(res,404,{error:'not_found'});
 if(limited(req))return send(res,429,{error:'rate_limited'});
 const x=await body(req);
 if(url==='/api/login'){
  const loginName=typeof x.username==='string'&&x.username.length<=24?x.username:'';
  const ip=req.socket.remoteAddress||'';if(loginBlocked(ip,loginName))return send(res,429,{error:'login_backoff'});
  const u=db.users.find(z=>z.name.toLowerCase()===loginName.toLowerCase());
  const salt=u?.salt||'00'.repeat(16),candidate=pw(typeof x.password==='string'?x.password:'',salt);
  if(!u||!equal(candidate,u.pass)){loginFailure(ip,loginName);return send(res,401,{error:'invalid_credentials'})}loginFailures.delete(ip+'|'+loginName.toLowerCase());
  db.sessions=db.sessions.filter(s=>s.expires>t);if(db.sessions.length>10000)return send(res,503,{error:'session_capacity'});
  const token=crypto.randomBytes(32).toString('hex');db.sessions.push({hash:hash(token),userId:u.id,expires:t+8*3600000});audit('login',u);save();return send(res,200,{token,role:u.role,username:u.name});
 }
 if(url==='/api/register'){
  if(!username(x.username)||!validPassword(x.password)||typeof x.code!=='string'||x.code.length>128)return send(res,400,{error:'invalid_input'});
  if(db.users.some(u=>u.name.toLowerCase()===x.username.toLowerCase()))return send(res,409,{error:'username_taken'});
  if(db.users.length>=MAX_USERS)return send(res,403,{error:'account_limit'});
  const invite=db.invites.find(i=>i.hash===hash(x.code)&&!i.used&&i.expires>t);if(!invite)return send(res,403,{error:'invalid_code'});
  const salt=crypto.randomBytes(16).toString('hex'),u={id:crypto.randomUUID(),name:x.username,role:'player',salt,pass:pw(x.password,salt)};
  invite.used=t;db.users.push(u);audit('register',u);save();return send(res,201,{created:true});
 }
 const u=auth(req,t);if(!u)return send(res,401,{error:'unauthorized'});
 if(url==='/api/player')return send(res,200,{version:1,player:{id:u.id,name:u.name,role:u.role},progression:'trainer-only',offlineImport:false});
 if(url==='/api/classes')return send(res,200,{version:1,classes:Core.CLASSES,maxLevel:Core.MAX_LEVEL,costHours:'10^level',source:'host'});
 if(url==='/api/equipment'||url==='/api/combat/events')return send(res,501,{error:'not_implemented',version:1});
 if(url==='/api/invites/revoke'){
  if(u.role!=='gm')return send(res,403,{error:'gm_only'});
  if(typeof x.code!=='string'||x.code.length>128)return send(res,400,{error:'invalid_input'});
  db.invites=db.invites.filter(i=>i.hash!==hash(x.code));audit('revoke_invite',u);save();return send(res,200,{ok:true});
 }
 if(url==='/api/logout'){db.sessions=db.sessions.filter(s=>s.userId!==u.id||s.hash!==hash((req.headers.authorization||'').slice(7)));save();return send(res,200,{ok:true})}
 if(url==='/api/invites'){
  if(u.role!=='gm')return send(res,403,{error:'gm_only'});
  const count=x.count===undefined?1:x.count,hours=x.hours===undefined?24:x.hours;
  if(!Number.isInteger(count)||count<1||count>10||!Number.isInteger(hours)||hours<1||hours>168)return send(res,400,{error:'invalid_limits'});
  db.invites=db.invites.filter(i=>!i.used&&i.expires>t);if(db.invites.length+count>10000)return send(res,503,{error:'invite_capacity'});
  const codes=[];for(let i=0;i<count;i++){const code='CL-'+crypto.randomBytes(18).toString('base64url');db.invites.push({hash:hash(code),expires:t+hours*3600000,used:null});codes.push(code)}audit('issue_invites',u);save();return send(res,201,{codes});
 }
 if(url==='/api/trainer'){
  let state=getTrainer(u,t);state=Core.advance(state,t);
  if(x.action==='select'&&Core.CLASSES.includes(x.className))state=Core.select(state,x.className,t);
  else if(x.action==='start')state=Core.startSelected(state,t);
  else if(x.action==='pause')state.active=null;
  else if(x.action!=='status')return send(res,400,{error:'invalid_action'});
  db.trainer[u.id]=state;save();return send(res,200,{state,timeMs:t});
 }
 return send(res,404,{error:'not_found'});
 }catch(e){if(snapshot)db=snapshot;return send(res,e.message==='payload_too_large'?413:e.message==='unsupported_media_type'?415:503,{error:e.message==='Host clock drift detected: training suspended'?'clock_untrusted':e.message==='unsupported_media_type'?'unsupported_media_type':e.message==='payload_too_large'?'payload_too_large':'request_failed'})}}
// Serialize API mutations, including the awaited body parse, so two concurrent uses of the same invite cannot both pass.
let mutationQueue=Promise.resolve(),pendingMutations=0;
// LMCP-S1 policy is fixed per request; failed mutations restore the in-memory snapshot.
const MAX_PENDING_MUTATIONS=64;
const server=http.createServer((req,res)=>{
 if(req.method!=='POST')return void handle(req,res);
 // Bound the queue: unbounded pending bodies could exhaust tablet RAM and stall valid requests.
 if(pendingMutations>=MAX_PENDING_MUTATIONS){req.resume();return send(res,503,{error:'server_busy'});}
 pendingMutations++;
 const task=mutationQueue.then(()=>handle(req,res));
 mutationQueue=task.catch(()=>{}).finally(()=>{pendingMutations--});
});
server.on('close',()=>{loop.disable();store.close()});
server.requestTimeout=10000;server.headersTimeout=10000;server.timeout=15000;server.keepAliveTimeout=5000;server.maxRequestsPerSocket=100;server.maxHeadersCount=64;
if(require.main===module)server.listen(PORT,HOST,()=>console.log(`Clash Lara V10.8 LAN Alpha: http://${HOST}:${PORT}`));
module.exports={server,handle};
