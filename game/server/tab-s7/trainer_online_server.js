// Clash Lara V10.3 — reference clock and trainer API. Node 22+, no dependencies.
// Run locally only. Deploy behind HTTPS + authentication for real multiplayer.
'use strict';
const http=require('node:http'), https=require('node:https'),fs=require('node:fs'),path=require('node:path');
const Core=require('./trainer_core.js');
const PORT=Number(process.env.PORT||8787),HOST=process.env.HOST||'127.0.0.1';
const DATA=path.resolve(process.env.TRAINER_DATA||'./trainer_online_state.json');
const TIME_URL=process.env.TIME_URL||'https://www.google.com/generate_204';
let reference=null, lastCheck=0, state;
try{state=Core.normalize(JSON.parse(fs.readFileSync(DATA,'utf8')),0)}catch{state=Core.create(0)}
function remoteTime(){return new Promise((resolve,reject)=>{const start=Date.now();const req=https.get(TIME_URL,{timeout:4000},res=>{const d=Date.parse(res.headers.date||'');res.resume();if(!Number.isFinite(d))return reject(Error('missing Date header'));resolve({epoch:d+500,uncertaintyMs:500+(Date.now()-start)/2});});req.on('timeout',()=>req.destroy(Error('time timeout')));req.on('error',reject)})}
async function clock(){const now=Date.now();if(reference&&now-lastCheck<60000)return reference;const t=await remoteTime();reference={offset:t.epoch-Date.now(),uncertaintyMs:t.uncertaintyMs,source:'HTTPS Date reference'};lastCheck=Date.now();return reference}
function save(){const tmp=DATA+'.tmp';fs.writeFileSync(tmp,JSON.stringify(state));fs.renameSync(tmp,DATA)}
function reply(res,code,data){res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'null'});res.end(JSON.stringify(data))}
function json(req){return new Promise((resolve,reject)=>{let b='';req.on('data',x=>{b+=x;if(b.length>4096)req.destroy()});req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch{reject(Error('invalid json'))}});req.on('error',reject)})}
async function handler(req,res){try{
 if(req.url==='/api/clock'&&req.method==='GET'){const c=await clock();return reply(res,200,{online:true,serverTimeMs:Date.now()+c.offset,uncertaintyMs:c.uncertaintyMs,source:c.source})}
 if(req.url==='/api/trainer'&&['GET','POST'].includes(req.method)){
  const c=await clock();const now=Date.now()+c.offset;
  // Never trust client timestamps or client-supplied XP. Serialize requests in one Node process.
  state=Core.advance(state,now);
  if(req.method==='POST'){const body=await json(req);if(body.action==='select'&&Core.CLASSES.includes(body.className))state=Core.select(state,body.className,now);
   else if(body.action==='start')state=Core.startSelected(state,now);
   else if(body.action==='pause'&&state.active)state=Core.toggle(state,now);
   else return reply(res,400,{error:'invalid action'});
  }
  save();return reply(res,200,{state,serverTimeMs:now,uncertaintyMs:c.uncertaintyMs,clockSource:c.source});
 }
 if(req.method==='GET'&&['/','/treinador_online.html','/trainer_core.js'].includes(req.url)){
  const file=req.url==='/trainer_core.js'?'trainer_core.js':'treinador_online.html';
  res.writeHead(200,{'content-type':file.endsWith('.js')?'application/javascript; charset=utf-8':'text/html; charset=utf-8','cache-control':'no-store'});return fs.createReadStream(path.join(__dirname,file)).pipe(res);
 }
 return reply(res,404,{error:'not found'});
 }catch(e){return reply(res,503,{error:'Online clock unavailable. Verified training paused.',details:String(e.message)})}}
if(require.main===module)http.createServer(handler).listen(PORT,HOST,()=>console.log(`Clash Lara trainer http://${HOST}:${PORT} — requires internet clock reference`));
module.exports={handler};
