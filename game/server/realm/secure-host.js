'use strict';
/* HTTPS-only LAN beta host. No trust in client-side loot, PvP health, world IDs, or damage totals.
   Bind to 127.0.0.1 by default; 0.0.0.0 only on private trusted LAN. */
const https=require('node:https'),fs=require('node:fs'),path=require('node:path');
const {SecureStore}=require('./secure-store'),{RealmCore,RealmError}=require('./realm-core');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json; charset=utf-8'};
function createServer({keyPath,certPath,storeFile,secret,root=path.join(__dirname,'../../www'),now}={}){
 const store=new SecureStore(storeFile,secret);const realm=new RealmCore(store,now);const CERT=fs.readFileSync(certPath),KEY=fs.readFileSync(keyPath);const ipRate=new Map();
 const staticRoot=path.resolve(root);function json(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));}
 function security(res){res.setHeader('x-frame-options','DENY');res.setHeader('referrer-policy','no-referrer');res.setHeader('x-content-type-options','nosniff');res.setHeader('permissions-policy','camera=(), microphone=(), geolocation=()');res.setHeader('content-security-policy',"default-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");res.setHeader('strict-transport-security','max-age=3600');}
 async function readBody(req){let size=0;const bufs=[];for await(const part of req){size+=part.length;if(size>8192)throw new RealmError(413,'PAYLOAD_TOO_LARGE');bufs.push(part);}let v;try{v=JSON.parse(Buffer.concat(bufs).toString()||'{}')}catch{throw new RealmError(400,'INVALID_JSON')};if(!v||typeof v!=='object'||Array.isArray(v))throw new RealmError(400,'INVALID_OBJECT');return v;}
 function preflight(req,url){if(req.method!=='POST'&&req.method!=='GET')throw new RealmError(405,'METHOD_NOT_ALLOWED');if(url.search&&url.pathname.startsWith('/api/'))throw new RealmError(400,'QUERY_FORBIDDEN');if(req.headers.origin){const authority=req.headers.host;const origin=new URL(req.headers.origin);if(origin.protocol!=='https:'||origin.host!==authority)throw new RealmError(403,'ORIGIN_DENIED');}if(req.method==='POST'&&req.headers['content-type']?.split(';')[0]!=='application/json')throw new RealmError(415,'JSON_REQUIRED');}
 function abuse(req){const ip=req.socket.remoteAddress||'unknown',nowMs=Date.now(),r=ipRate.get(ip)||{since:nowMs,count:0};if(nowMs-r.since>60000){r.since=nowMs;r.count=0;}if(++r.count>1200)throw new RealmError(429,'HOST_RATE_LIMIT');ipRate.set(ip,r);if(ipRate.size>500)for(const [k,v]of ipRate)if(nowMs-v.since>60000)ipRate.delete(k);}
 const server=https.createServer({key:KEY,cert:CERT,minVersion:'TLSv1.2'},async(req,res)=>{security(res);try{
 abuse(req);const url=new URL(req.url,'https://'+(req.headers.host||'localhost'));preflight(req,url);
 if(url.pathname==='/api/health'&&req.method==='GET')return json(res,200,{ok:true,mode:'lan-beta',apiVersion:7,transport:'https',realPlayers:true,paidCurrency:false});
 if(url.pathname.startsWith('/api/')){
  if(req.method==='POST'&&url.pathname==='/api/identity'){const b=await readBody(req);return json(res,201,realm.newIdentity(b.name));}
  if(req.method==='POST'&&url.pathname==='/api/login'){const b=await readBody(req);return json(res,200,realm.login(b.playerId,b.secret));}
  const auth=(req.headers.authorization||'').match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];if(!auth)throw new RealmError(401,'AUTH_REQUIRED');
  if(req.method==='POST'&&url.pathname==='/api/logout')return json(res,200,realm.logout(auth));
  if(req.method==='GET'&&url.pathname==='/api/snapshot')return json(res,200,realm.execute(auth,'snapshot'));
  if(req.method!=='POST')throw new RealmError(405,'METHOD_NOT_ALLOWED');
  const route={invite:'invite',visit:'visit',home:'home',move:'move','guild/create':'guildCreate','guild/join':'guildJoin',raid:'raid',gesture:'gesture','duel/challenge':'duelChallenge','duel/accept':'duelAccept','duel/gesture':'duelGesture'}[url.pathname.slice(5)];
  if(!route)throw new RealmError(404,'ACTION_NOT_FOUND');const b=await readBody(req);const op=req.headers['x-request-id'];if(!op)throw new RealmError(400,'REQUEST_ID_REQUIRED');return json(res,200,realm.execute(auth,route,b,op));
 }
 if(req.method!=='GET')throw new RealmError(405,'METHOD_NOT_ALLOWED');const file=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));if(file.includes('..')||file.includes('\\')||file.startsWith('.'))throw new RealmError(403,'PATH_FORBIDDEN');const resolved=path.resolve(staticRoot,file);if(!resolved.startsWith(staticRoot+path.sep))throw new RealmError(403,'PATH_FORBIDDEN');const ext=path.extname(resolved);if(!MIME[ext])throw new RealmError(403,'TYPE_FORBIDDEN');let stat;try{stat=fs.statSync(resolved)}catch{throw new RealmError(404,'NOT_FOUND')}if(!stat.isFile())throw new RealmError(404,'NOT_FOUND');res.writeHead(200,{'content-type':MIME[ext],'cache-control':ext==='.html'?'no-store':'no-cache'});return fs.createReadStream(resolved).pipe(res);
 }catch(e){return json(res,e.status||500,{ok:false,error:e instanceof RealmError?e.code:'SERVER_ERROR'});}});
 return {server,realm,store};
}
if(require.main===module){const root=path.resolve(__dirname,'../..');const certPath=process.env.TLS_CERT||path.join(root,'private/lan-cert.pem'),keyPath=process.env.TLS_KEY||path.join(root,'private/lan-key.pem');const secret=process.env.LARA_REALM_KEY;try{const {server}=createServer({keyPath,certPath,storeFile:process.env.REALM_DB||path.join(root,'private/worlds.enc'),secret});const port=Number(process.env.PORT||8787),host=process.env.HOST||'127.0.0.1';server.listen(port,host,()=>console.log(`Lara Rune Realms V7 secure HTTPS listening on https://${host}:${server.address().port}`));}catch(e){console.error('Host not started:',e.message);process.exit(1)}}
module.exports={createServer};
