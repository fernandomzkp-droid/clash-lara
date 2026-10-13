'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {SecureStore}=require('../server/realm/secure-store'),{RealmCore}=require('../server/realm/realm-core');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lara-persist-v7-')),database=path.join(tmp,'worlds.enc'),secret='safe-temporary-mock-passphrase-34871';try{
 let store=new SecureStore(database,secret),first=new RealmCore(store),a=first.newIdentity('Guardião'),b=first.newIdentity('Visitante'),invite=first.execute(a.session,'invite',{},'op-persist-invite0001');
 const joined=first.execute(b.session,'visit',{worldId:invite.worldId,code:invite.inviteCode},'op-persist-visit0001');assert.equal(joined.world.id,a.worldId);
 const baseline=JSON.parse(fs.readFileSync(database,'utf8'));assert(baseline.ciphertext&&!JSON.stringify(baseline).includes(a.playerId));
 store=new SecureStore(database,secret);const restarted=new RealmCore(store),loginA=restarted.login(a.playerId,a.secret),loginB=restarted.login(b.playerId,b.secret);
 assert.equal(restarted.execute(loginB.session,'snapshot').world.id,a.worldId);
 const again=restarted.execute(loginA.session,'invite',{},'op-persist-invite0001');assert.deepEqual(again,invite);
 const changed=restarted.execute(loginA.session,'invite',{},'op-persist-invite0002');assert.notEqual(changed.inviteCode,invite.inviteCode);
 assert.throws(()=>restarted.execute(loginB.session,'visit',{worldId:a.worldId,code:invite.inviteCode},'op-persist-invalid0002'),e=>e.code==='INVITE_REQUIRED');
 const plaintext=fs.readFileSync(database,'utf8');assert(!plaintext.includes(a.playerId));assert(!plaintext.includes(a.secret));
 console.log('V7 persistence: save restart login world ID idempotency invite rotation encrypted data PASS');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
