'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),source=path.join(root,'game'),run=path.join(source,'scripts/build-standalone.js');
execFileSync(process.execPath,[run],{cwd:source,stdio:'inherit'});
const src=path.join(source,'LARA_RUNE_CLASH_OFFLINE.html');if(!fs.existsSync(src))throw Error('Game HTML não foi gerado');
const out=[['android/app/src/main/assets/game.html',src],['ios/www/game.html',src],['windows/www/game.html',src],['ios/www/index.html','shared/launcher.html'],['windows/www/index.html','shared/launcher.html']];
for(const [dest,orig]of out){const target=path.join(root,dest),from=path.isAbsolute(orig)?orig:path.join(root,orig);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(from,target);console.log('Preparado:',dest);}
// The online LAN server uses game/www (same canonical source), no separate copy.

const hostScripts=["rpg-system.js","world-domain.js","phone-realm.js"].map(f=>fs.readFileSync(path.join(source,"www",f),"utf8").replaceAll("</script","<\\/script")).join("\n");
fs.writeFileSync(path.join(root,"android/app/src/main/assets/host.html"),"<!doctype html><meta charset=utf-8><script>"+hostScripts+"\nwindow.phoneRealm=new PhoneRealm.Realm();</script>");
