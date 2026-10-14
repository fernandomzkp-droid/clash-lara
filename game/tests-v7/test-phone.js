'use strict';
const assert=require('node:assert/strict'),{Realm}=require('../www/phone-realm'),RPG=require('../www/rpg-system'),W=require('../www/world-domain');
let now=100000,op=0;const realm=new Realm({},()=>now),a='a'.repeat(40),b='b'.repeat(40);const call=(key,route,body={})=>realm.execute({key,route,body,op:'request-'+(++op)});
let hero=RPG.gainXp(RPG.sanitize(null),500);hero.owned.push('moonblade');hero.equipment.weapon='moonblade';
const one=realm.execute({key:a,route:'join',owner:true,body:{name:'Dono',hero,world:W.defaultProfile()}});const two=realm.execute({key:b,route:'join',body:{name:'Amigo',hero:RPG.sanitize(null),world:W.defaultProfile()}});
assert(one.ok&&two.ok);assert.equal(one.hero.classXp.duelist,500);assert.equal(one.hero.equipment.weapon,'moonblade');assert.equal(realm.snapshot(realm.players[a]).online.length,2);
assert.equal(call(a,'move',{x:95,y:63}).ok,false);now+=120;assert(call(a,'move',{x:4,y:4}).ok);assert(!call(a,'move',{x:5,y:4}).ok);now+=400;
assert(call(a,'raid').ok);assert(call(b,'raid').ok);now+=400;
const hit=call(a,'gesture',{code:'Z',damage:1e20});assert(hit.ok&&hit.damage<100);assert(!call(a,'gesture',{code:'Z'}).ok);
const request={key:b,route:'gesture',body:{code:'R'},op:'request-repeat'};const result=realm.execute(request);assert(result.ok);const hp=realm.boss.hp;assert.deepEqual(realm.execute(request),result);assert.equal(realm.boss.hp,hp);assert(!realm.execute({...request,body:{code:'Z'}}).ok);
for(let i=0;i<400&&realm.boss.hp;i++){now+=400;assert(call(a,'gesture',{code:i%8===0?'D':'Z'}).ok);}
assert.equal(realm.boss.hp,0);const won=realm.snapshot(realm.players[a]);assert(won.hero.classXp.duelist>500);assert(won.savedWorld.wallet.gold>one.savedWorld.wallet.gold);
assert(call(a,'logout').ok);now+=1000;const rejoin=realm.execute({key:a,route:'join',owner:true,body:{name:'Dono',hero:won.hero,world:won.savedWorld}});assert.equal(rejoin.hero.classXp.duelist,won.hero.classXp.duelist);
const changed=RPG.selectClass(won.hero,'arcanist').profile;assert.equal(RPG.classProgress(changed,'arcanist').level,1);assert(RPG.classProgress(changed,'duelist').level>1);assert.equal(W.regionAt(80,50).id,'volcano');assert.equal(W.sanitize({...W.defaultProfile(),position:{x:0,y:0}}).position.x,0);assert(W.TEMPLATES.length>=100);assert.equal(W.REGIONS.length,6);
const before=realm.players[a].x;for(let i=0;i<40;i++)call(a,'move',{x:before+1,y:4});assert(realm.players[a].blockedUntil>now);now+=4000;assert(call(a,'snapshot').ok);
console.log('PHONE PASS: two peers, preserved offline equipment and class XP, shared boss, authoritative damage, cooldowns, replay protection, rewards, reconnect and spam pause');
