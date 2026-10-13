'use strict';
/* AES-256-GCM sealed persistence; stable per-install random KDF salt, unique random IV on every write.
   Host secret stays outside the project bundle. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
class SecureStore{
 constructor(file,passphrase){if(!passphrase||String(passphrase).length<16)throw Error('LARA_REALM_KEY needs >=16 characters');this.file=path.resolve(file);this.passphrase=passphrase;let raw=null;if(fs.existsSync(this.file)){raw=JSON.parse(fs.readFileSync(this.file,'utf8'));if(raw.format!=='LARA-GCM1')throw Error('Unsupported encrypted state');}this.salt=raw?Buffer.from(raw.salt,'base64'):crypto.randomBytes(16);this.key=crypto.scryptSync(this.passphrase,this.salt,32,{N:16384,r:8,p:1});this.state=raw?this.unseal(raw):null;}
 unseal(raw){const nonce=Buffer.from(raw.nonce,'base64'),tag=Buffer.from(raw.tag,'base64');const decipher=crypto.createDecipheriv('aes-256-gcm',this.key,nonce);decipher.setAAD(Buffer.from('lara-realm-state-v1'));decipher.setAuthTag(tag);const data=Buffer.concat([decipher.update(Buffer.from(raw.ciphertext,'base64')),decipher.final()]);return JSON.parse(data.toString('utf8'))}
 write(state){const dir=path.dirname(this.file);fs.mkdirSync(dir,{recursive:true,mode:0o700});const nonce=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',this.key,nonce);cipher.setAAD(Buffer.from('lara-realm-state-v1'));const ciphertext=Buffer.concat([cipher.update(Buffer.from(JSON.stringify(state))),cipher.final()]);const payload={format:'LARA-GCM1',salt:this.salt.toString('base64'),nonce:nonce.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')};const temp=this.file+'.tmp-'+crypto.randomBytes(5).toString('hex');fs.writeFileSync(temp,JSON.stringify(payload),{mode:0o600,flag:'wx'});fs.renameSync(temp,this.file);this.state=state;}
}
module.exports={SecureStore};
