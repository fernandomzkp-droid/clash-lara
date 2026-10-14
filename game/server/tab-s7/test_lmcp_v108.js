'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'clash108-'));const port=32000+Math.floor(Math.random()*10000),base=`http://127.0.0.1:${port}`;const proc=spawn(process.execPath,[path.join(__dirname,'tab_s7_server.js')],{env:{...process.env,HOST:'127.0.0.1',PORT:String(port),CLASH_DB:path.join(dir,'db.json'),CLASH_GM_PASSWORD:'test_secure_password_long_1234'},stdio:'pipe'});let n=0;
try{let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,30))}assert.ok(ready);n++;
let h=await(await fetch(base+'/api/health')).json();assert.equal(h.policyVersion,'lmcp-s1-1.0');n++;assert.ok(h.dbBytes>0);n++;
const post=(password)=>fetch(base+'/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:'gm',password})});
for(let i=0;i<3;i++){const r=await post('wrong');assert.equal(r.status,401);n++}
assert.equal((await post('test_secure_password_long_1234')).status,429);n++;
console.log(`PASS ${n} LMCP V10.8 targeted checks`);
}finally{proc.kill();fs.rmSync(dir,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
