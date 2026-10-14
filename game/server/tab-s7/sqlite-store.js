'use strict';
const fs=require('node:fs'),path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
function validate(db){
 if(!db||!['users','invites','sessions','audit'].every(k=>Array.isArray(db[k]))||!db.trainer||typeof db.trainer!=='object'||Array.isArray(db.trainer))throw Error('Invalid database');
 return db;
}
class Store {
 constructor(legacy,maxBytes=8*1024*1024){
  this.maxBytes=maxBytes;this.file=legacy+'.sqlite';
  fs.mkdirSync(path.dirname(this.file),{recursive:true});
  this.sql=new DatabaseSync(this.file);fs.chmodSync(this.file,0o600);
  this.sql.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;');
  if(this.sql.prepare('PRAGMA quick_check').get().quick_check!=='ok')throw Error('Database integrity failed; restore a verified backup');
  this.sql.exec('CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload))); PRAGMA user_version=1;');
  if(!this.sql.prepare('SELECT id FROM state WHERE id=1').get()){
   let db={users:[],invites:[],sessions:[],audit:[],trainer:{}};
   if(fs.existsSync(legacy)){
    if(fs.statSync(legacy).size>maxBytes)throw Error('Database exceeds configured capacity');
    db=validate(JSON.parse(fs.readFileSync(legacy,'utf8')));
    // Preserve the JSON source byte-for-byte for rollback. Never overwrite an existing backup.
    try{fs.copyFileSync(legacy,legacy+'.pre-sqlite.bak',fs.constants.COPYFILE_EXCL);fs.chmodSync(legacy+'.pre-sqlite.bak',0o600);}catch(e){if(e.code!=='EEXIST')throw e;}
   }
   this.sql.prepare('INSERT OR IGNORE INTO state VALUES(1,0,?)').run(JSON.stringify(db));
  }
 }
 load(){const row=this.sql.prepare('SELECT * FROM state WHERE id=1').get();this.revision=row.revision;return validate(JSON.parse(row.payload));}
 save(db){
  const payload=JSON.stringify(validate(db));if(Buffer.byteLength(payload)>this.maxBytes)throw Error('database_capacity');
  this.sql.exec('BEGIN IMMEDIATE');
  try{
   const r=this.sql.prepare('UPDATE state SET revision=revision+1,payload=? WHERE id=1 AND revision=?').run(payload,this.revision);
   if(r.changes!==1)throw Error('database_revision_conflict');
   this.sql.exec('COMMIT');this.revision++;
  }catch(e){this.sql.exec('ROLLBACK');throw e;}
 }
 backup(dest){if(fs.existsSync(dest))throw Error('Backup destination exists');this.sql.prepare('VACUUM INTO ?').run(dest);fs.chmodSync(dest,0o600);}
 close(){this.sql.close();}
}
module.exports={Store,validate};
