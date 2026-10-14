'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {Store}=require('./sqlite-store'),C=require('./trainer_core');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lara-sqlite-')),file=path.join(dir,'legacy.json');
const original={users:[{id:'player1',name:'Existing'}],invites:[],sessions:[],audit:[],trainer:{player1:C.startSelected(C.create(0),0)}};
try{
 fs.writeFileSync(file,JSON.stringify(original));let a=new Store(file);let db=a.load();assert.deepEqual(db,original);assert.equal(fs.readFileSync(file,'utf8'),fs.readFileSync(file+'.pre-sqlite.bak','utf8'));
 db.trainer.player1=C.advance(db.trainer.player1,C.HOUR);a.save(db);a.close();a=new Store(file);assert.equal(a.load().trainer.player1.classes.Duelista.level,1);
 const stale=new Store(file);const staleDb=stale.load();a.save(a.load());assert.throws(()=>stale.save(staleDb),/revision_conflict/);stale.close();
 a.backup(path.join(dir,'backup.sqlite'));a.close();
 const crash=spawnSync(process.execPath,['-e',`const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync(process.argv[1]);d.exec('BEGIN IMMEDIATE');d.prepare('UPDATE state SET payload=? WHERE id=1').run('{}');process.kill(process.pid,'SIGKILL')`,file+'.sqlite']);assert.equal(crash.signal,'SIGKILL');
 a=new Store(file);assert.equal(a.load().trainer.player1.classes.Duelista.level,1);a.close();
 fs.copyFileSync(path.join(dir,'backup.sqlite'),path.join(dir,'restored.json.sqlite'));a=new Store(path.join(dir,'restored.json'));assert.equal(a.load().trainer.player1.classes.Duelista.level,1);a.close();
 fs.writeFileSync(path.join(dir,'bad.json'),'{');assert.throws(()=>new Store(path.join(dir,'bad.json')));
 console.log('PASS SQLite: JSON migration, preserved rollback source, persistence, stale writer rejection, SIGKILL rollback, backup restore, invalid import');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
