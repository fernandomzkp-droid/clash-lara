/* Rune World V6: pure offline-friendly MMO economy, equipment, clan and raid scoring.
   Authoritative server integration must implement the same contracts; localStorage is NOT authoritative. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.RuneWorld=api})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const RARITIES=[{id:'white',name:'Comum',color:'#e3e7ee',chance:.8},{id:'green',name:'Incomum',color:'#70e5a1',chance:.4},{id:'blue',name:'Raro',color:'#71b7ff',chance:.1},{id:'red',name:'Lendário',color:'#ff6d77',chance:.03},{id:'gold',name:'Arcano',color:'#ffd36f',chance:0}];
const SLOT_LIST=[['helm','Elmo'],['chest','Peito'],['gloves','Luvas'],['boots','Botas'],['pants','Calça'],['main','Arma principal'],['off','Mão secundária'],['ring1','Anel 1'],['ring2','Anel 2'],['amulet','Amuleto'],['earring','Brinco'],['bracelet','Bracelete'],['pet','Mascote']];
const TEMPLATES=[
 ['iron_helm','helm','Elmo do Vigia','⛑','armor',{maxHp:9,armor:.012}],['sage_helm','helm','Coroa do Ritual','♛','armor',{ability:.035,maxFocus:5}],
 ['iron_chest','chest','Couraça da Aurora','🛡','armor',{maxHp:17,armor:.018}],['sage_chest','chest','Vestimenta Nebular','✧','armor',{ability:.045,maxHp:6}],
 ['iron_gloves','gloves','Manoplas de Ferro','✊','armor',{attack:.032,armor:.006}],['sage_gloves','gloves','Luvas do Teurgo','✦','armor',{ability:.032,regen:.12}],
 ['iron_boots','boots','Botas da Sentinela','🥾','armor',{armor:.008,dodgeBonus:.035}],['sage_boots','boots','Passos da Névoa','⌁','armor',{dodgeBonus:.06,regen:.08}],
 ['iron_pants','pants','Grevas do Guardião','♟','armor',{maxHp:12,armor:.009}],['sage_pants','pants','Calças do Vento','❈','armor',{maxFocus:5,dodgeBonus:.04}],
 ['sword','main','Espada do Errante','⚔','one',{attack:.10}],['mace','main','Maça Solar','✹','one',{attack:.07,armor:.02}],['staff2','main','Cajado Duas Mãos','☄','two',{ability:.23,maxFocus:12}],['greatsword','main','Montante Titânico','🗡','two',{attack:.24}],
 ['shield','off','Escudo de Pedra','⬡','shield',{maxHp:16,armor:.065}],['focus','off','Cajado Curto Arcano','ϟ','focus',{ability:.12,regen:.28}],['dagger','off','Adaga de Retorno','◈','one',{attack:.07,dodgeBonus:.04}],
 ['ring_flame','ring1','Anel da Brasa','◉','accessory',{burnPower:.11}],['ring_moon','ring1','Anel da Lua','☾','accessory',{ability:.055}],
 ['ring_flame_b','ring2','Anel da Brasa','◉','accessory',{burnPower:.11}],['ring_moon_b','ring2','Anel da Lua','☾','accessory',{ability:.055}],
 ['amulet','amulet','Amuleto do Equilíbrio','◇','accessory',{maxHp:7,regen:.24}],['earring','earring','Brinco do Vento','❖','accessory',{dodgeBonus:.07}],
 ['bracelet','bracelet','Bracelete da Forja','◈','accessory',{attack:.045,ability:.035}],['wolf','pet','Lobinho Astral','🐺','pet',{summonPower:.14,maxHp:5}],['owl','pet','Coruja Celeste','🦉','pet',{perfect:.055,regen:.15}]
].map(([id,slot,name,icon,hands,mod])=>({id,slot,name,icon,hands,mod}));
const AFFIXES=[{key:'attack',label:'Força',unit:'%',min:.015,max:.052},{key:'ability',label:'Feitiçaria',unit:'%',min:.015,max:.052},{key:'armor',label:'Resistência',unit:'%',min:.008,max:.026},{key:'maxHp',label:'Vitalidade',unit:'PV',min:3,max:11},{key:'maxFocus',label:'Reserva',unit:'Foco',min:3,max:10},{key:'perfect',label:'Precisão',unit:'%',min:.01,max:.04},{key:'regen',label:'Fluxo',unit:'/s',min:.10,max:.30},{key:'burnPower',label:'Fúria Ígnea',unit:'%',min:.015,max:.06},{key:'lifesteal',label:'Vampirismo',unit:'%',min:.005,max:.018},{key:'dodgeBonus',label:'Passo',unit:'%',min:.015,max:.06}];
const BOSSES=[{id:'boss',name:'Dragão do Eclipse',hp:850,interval:5.5,element:'Fogo',telegraph:'DESENHE ↓ PARA BLOQUEAR CHAMAS',color:'#ff8b68'},{id:'titan',name:'Titã das Fendas',hp:1250,interval:4.8,element:'Terra',telegraph:'DESENHE ↓ PARA BARRAR TERREMOTO',color:'#eac083'},{id:'specter',name:'Rainha do Véu',hp:680,interval:4.1,element:'Sombra',telegraph:'DESENHE ← PARA EVITAR MALDIÇÃO',color:'#c2a1ff'}];
const mapProps=[{id:'village',name:'Vila Arcanis',icon:'⌂',x:3,y:4,type:'town'},{id:'mine',name:'Minas de Vitra',icon:'◆',x:9,y:4,type:'mine'},{id:'merchant',name:'Mercador',icon:'⚖',x:4,y:7,type:'merchant'},{id:'forge',name:'Altar de Fusão',icon:'⚒',x:9,y:9,type:'forge'},{id:'boss',name:'Dragão do Eclipse',icon:'♜',x:19,y:9,type:'boss'},{id:'forest',name:'Bosque de Espíritos',icon:'❈',x:15,y:3,type:'hunt'},{id:'guild',name:'Salão dos Clãs',icon:'⚑',x:5,y:10,type:'guild'},{id:'titan',name:'Titã das Fendas',icon:'♜',x:21,y:3,type:'boss'},{id:'specter',name:'Rainha do Véu',icon:'☽',x:14,y:13,type:'boss'}];

const REGIONS=[
{id:'meadow',name:'Vale da Aurora',x:0,y:0,w:32,h:32,min:1,color:'#305545',accent:'#85cd8a',boss:'boss',types:['slime','wolf','beetle']},
{id:'marsh',name:'Pântano dos Sussurros',x:32,y:0,w:32,h:32,min:4,color:'#253f43',accent:'#73cba9',boss:'specter',types:['spider','wisp','shaman']},
{id:'ice',name:'Cordilheira de Cristal',x:64,y:0,w:32,h:32,min:8,color:'#3f5668',accent:'#b5e7ff',boss:'frost',types:['golem','wolf','wisp']},
{id:'ruins',name:'Ruínas de Arcanis',x:0,y:32,w:32,h:32,min:12,color:'#3e354c',accent:'#cfa4ee',boss:'titan',types:['skeleton','shaman','golem']},
{id:'desert',name:'Deserto Solar',x:32,y:32,w:32,h:32,min:16,color:'#62503a',accent:'#efce87',boss:'scarab',types:['beetle','skeleton','spider']},
{id:'volcano',name:'Fendas de Obsidiana',x:64,y:32,w:32,h:32,min:22,color:'#402f37',accent:'#ff9263',boss:'inferno',types:['drake','golem','shaman']}
];
const regionAt=(x,y)=>REGIONS.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)||REGIONS[0];
const MOB_TYPES={slime:{name:'Gosma prismática',hp:70,interval:3.8,color:'#8ce0b5',behavior:'Regenera vida; interrompa com ϟ'},wolf:{name:'Lobo espectral',hp:95,interval:2.7,color:'#accbec',behavior:'Investida rápida: esquive ←'},beetle:{name:'Besouro de ferro',hp:120,interval:4.2,color:'#d7af67',behavior:'Carapaça reduz dano; quebre com ↑'},spider:{name:'Aranha do lodo',hp:85,interval:3.1,color:'#b1b778',behavior:'Veneno: bloqueie ↓'},wisp:{name:'Fagulha arcana',hp:65,interval:2.9,color:'#b3adff',behavior:'Vulnerável a magia ○'},shaman:{name:'Xamã do véu',hp:110,interval:4,color:'#bd86dc',behavior:'Canaliza feitiço; interrompa com ϟ'},golem:{name:'Golem ancestral',hp:170,interval:5,color:'#b5cad0',behavior:'Pele de pedra; use ↑'},skeleton:{name:'Sentinela esquecida',hp:100,interval:3.4,color:'#e2d6b1',behavior:'Ataques em sequência; defenda ↓'},drake:{name:'Draco de cinzas',hp:155,interval:3.5,color:'#f28c64',behavior:'Sopro de fogo; esquive ←'}};
Object.assign(MOB_TYPES,{
 treant:{name:'Ent da Floresta',hp:185,interval:4.7,color:'#7fcf78',behavior:'Raízes e impacto; esquive ←'},
 bandit:{name:'Mercenário Corrompido',hp:128,interval:3.0,color:'#e19a7a',behavior:'Combos rápidos; bloqueie ↓'},
 harpy:{name:'Harpia do Vendaval',hp:108,interval:2.6,color:'#b7badf',behavior:'Investida aérea; esquive ←'},
 basilisk:{name:'Basilisco de Vitra',hp:230,interval:4.4,color:'#8dc6a4',behavior:'Olhar petrificante; defendá-se ↓'},
 lich:{name:'Lich das Ruínas',hp:170,interval:3.3,color:'#b08aff',behavior:'Feitiçaria sombria; contra-ataque ○'},
 scorpion:{name:'Escorpião do Deserto',hp:140,interval:3.2,color:'#e4b46e',behavior:'Veneno e cauda; esquive ←'},
 phoenix:{name:'Fênix das Cinzas',hp:215,interval:3.6,color:'#ff9c69',behavior:'Chamas que renascem; use ○'},
 cyclops:{name:'Ciclope da Montanha',hp:260,interval:5.2,color:'#bdaca3',behavior:'Martelo esmagador; defenda ↓'},
 siren:{name:'Sereia do Pântano',hp:125,interval:3.4,color:'#86dfe8',behavior:'Encantamento; ataque com ○'},
 gargoyle:{name:'Gárgula de Obsidiana',hp:250,interval:4.7,color:'#9993ad',behavior:'Corpo rochoso; rompa com ↑'},
 wraith:{name:'Espectro Vazio',hp:135,interval:3.1,color:'#b1a2ff',behavior:'Ataque etéreo; círculo ○'},
 gryphon:{name:'Grifo Imperial',hp:200,interval:3.0,color:'#e2cc8e',behavior:'Mergulho veloz; esquive ←'}
});
REGIONS[0].types.push('treant','bandit','gryphon');
REGIONS[1].types.push('siren','wraith','basilisk');
REGIONS[2].types.push('harpy','cyclops','gryphon');
REGIONS[3].types.push('lich','gargoyle','wraith');
REGIONS[4].types.push('scorpion','bandit','basilisk');
REGIONS[5].types.push('phoenix','gargoyle','cyclops');
BOSSES.push({id:'frost',name:'Serpe da Geada',hp:1500,interval:4.5,element:'Gelo',telegraph:'ESQUIVE ← DO SOPRO GLACIAL',color:'#a5e7ff'},{id:'scarab',name:'Escaravelho Solar',hp:1900,interval:5.2,element:'Sol',telegraph:'BLOQUEIE ↓ A ONDA SOLAR',color:'#ffd176'},{id:'inferno',name:'Imperador das Cinzas',hp:2400,interval:3.8,element:'Lava',telegraph:'ESQUIVE ← DA ERUPÇÃO',color:'#ff8464'});
// Exploration points: approachable in every region rather than empty far-away land.
for(const [i,region] of REGIONS.entries()){
 if(i){mapProps.push({id:'camp-'+region.id,name:'Acampamento · '+region.name,icon:'⌂',x:region.x+5,y:region.y+5,type:'town'});mapProps.push({id:'mine-'+region.id,name:'Jazida '+region.name,icon:'◆',x:region.x+9,y:region.y+8,type:'mine'});mapProps.push({id:'hunt-'+region.id,name:'Território selvagem',icon:'⚔',x:region.x+14,y:region.y+13,type:'hunt'});}
 if(i>=2)mapProps.push({id:region.boss,name:BOSSES.find(b=>b.id===region.boss).name,icon:'♜',x:region.x+24,y:region.y+24,type:'boss'});
 const theme=['Silvestre','do Lodo','Glacial','do Véu','Solar','de Obsidiana'][i];
 for(const [slot,label] of SLOT_LIST){const id='set_'+region.id+'_'+slot;TEMPLATES.push({id,slot,name:label+' '+theme,icon:slot==='pet'?'✧':slot==='main'?'⚔':slot.includes('ring')?'◉':'◇',hands:slot==='main'?'one':slot==='off'?'shield':slot==='pet'?'pet':['helm','chest','gloves','boots','pants'].includes(slot)?'armor':'accessory',mod:slot==='main'?{attack:.09+i*.012}:slot==='off'?{armor:.04+i*.004}:slot==='pet'?{summonPower:.14+i*.02}:{maxHp:4+i*2,ability:.014+i*.003},theme:region.id});}
}
// WYD-inspired tier ladder; names that appear in historical gear guides are only labels.
// All silhouettes, stats, and procedural assets are original Clash Lara work.
const SET_TIERS=Object.freeze([{id:'mortal',name:'Mortal',power:1,glow:'#a5c5d4'},
 {id:'arch',name:'Arch',power:1.5,glow:'#72dff0'},
 {id:'celestial',name:'Celestial',power:2.2,glow:'#e9bd77'},
 {id:'subcelestial',name:'SubCelestial',power:3.1,glow:'#ce8aff'}]);
const SET_FAMILIES=Object.freeze([
 ['duelist','Melpômene','#ecbf79'],['arcanist','Potâmides','#8ca9ff'],
 ['sentinel','Bastião dos Reis','#91e2c8'],['hunter','Urânia','#98dc7c'],
 ['assassin','Véu do Crepúsculo','#d79de5'],['summoner','Dríade','#75daac'],
 ['cleric','Santuário de Aurora','#ffeab3'],['berserker','Ruptura Carmesim','#f88576'],
 ['monk','Voto do Firmamento','#c9a0ed'],['elementalist','Círculo Primordial','#a0d9ff']
]);
const ARMOR_PIECES=[['helm','Elmo'],['chest','Peitoral'],['gloves','Manoplas'],['pants','Calças'],['boots','Botas']];
for(const [ci,[familyId,familyName,color]] of SET_FAMILIES.entries())for(const [ti,tier] of SET_TIERS.entries()){
 for(const [slot,label] of ARMOR_PIECES){
  const extraStat=slot==='chest'?{armor:.018, maxHp:13}:slot==='helm'?{maxHp:9,ability:.015}:slot==='gloves'?{attack:.023,ability:.023}:slot==='pants'?{maxHp:10,dodgeBonus:.016}:{dodgeBonus:.024,regen:.1};
  TEMPLATES.push({id:`armor_${familyId}_${tier.id}_${slot}`,slot,name:`${label} ${familyName} · ${tier.name}`,icon:slot==='chest'?'🛡':'◇',hands:'armor',mod:Object.fromEntries(Object.entries(extraStat).map(([k,v])=>[k,+(v*tier.power).toFixed(4)])),theme:REGIONS[ci%REGIONS.length].id,setFamily:familyId,setName:familyName,setTier:tier.id,accent:color});
 }
 const magic=['arcanist','summoner','cleric','elementalist'].includes(familyId),hands=['berserker','monk'].includes(familyId)?'two':'one';
 TEMPLATES.push({id:`weapon_${familyId}_${tier.id}`,slot:'main',name:`${magic?'Cajado':'Arma'} ${familyName} · ${tier.name}`,icon:magic?'✦':'⚔',hands,mod:magic?{ability:.13*tier.power,regen:.18*tier.power}:{attack:.14*tier.power,perfect:.015*tier.power},theme:REGIONS[ci%REGIONS.length].id,setFamily:familyId,setName:familyName,setTier:tier.id,accent:color});
}
function setBonuses(profile){
 const count=new Map();for(const slot of ['helm','chest','gloves','pants','boots']){
  const id=profile?.armory?.[slot],it=profile?.inventory?.find(v=>v.uid===id),t=it&&template(it.baseId);
  if(!t?.setFamily||!it.durability)continue;const key=t.setFamily+':'+t.setTier;
  count.set(key,(count.get(key)||0)+1);
 }
 return [...count].map(([key,pieces])=>{const [family,tier]=key.split(':'),meta=SET_TIERS.find(x=>x.id===tier),name=SET_FAMILIES.find(x=>x[0]===family)?.[1]||family;
  const mod=pieces>=5?{attack:.05*meta.power,ability:.05*meta.power,maxHp:12*meta.power,regen:.15*meta.power}:pieces>=3?{attack:.025*meta.power,ability:.025*meta.power,maxHp:6*meta.power}:{};
  return {family,tier,name,pieces,mod,color:meta.glow,active:pieces>=3};});
}
function ascendSet(p,uidValue){const n=sanitize(p),it=n.inventory.find(x=>x.uid===uidValue),t=it&&template(it.baseId);
 if(!t?.setFamily||!t.setTier)return {ok:false,reason:'Selecione uma peça de set evolutivo'};
 const ix=SET_TIERS.findIndex(v=>v.id===t.setTier);if(ix>=SET_TIERS.length-1)return {ok:false,reason:'Set na evolução máxima'};
 if(it.level<9)return {ok:false,reason:'Requer aprimoramento +9 da peça atual'};
 const cost={gold:130*(ix+1),forge:180*(ix+1),ore:20*(ix+1),crystal:3*(ix+1)};
 if(n.wallet.gold<cost.gold||n.wallet.forge<cost.forge||n.materials.ore<cost.ore||n.materials.crystal<cost.crystal)return {ok:false,reason:`Evolução requer ${cost.gold} gold, ${cost.forge} essência, ${cost.ore} minério e ${cost.crystal} cristais`};
 const next=TEMPLATES.find(v=>v.setFamily===t.setFamily&&v.setTier===SET_TIERS[ix+1].id&&v.slot===t.slot);if(!next)return {ok:false,reason:'Evolução não encontrada'};
 for(const k of ['gold','forge'])n.wallet[k]-=cost[k];for(const k of ['ore','crystal'])n.materials[k]-=cost[k];
 const newItem=makeItem(next.id,it.rarity);newItem.level=0;newItem.extras=it.extras.map(v=>({...v}));
 n.inventory=n.inventory.filter(v=>v.uid!==it.uid);n.inventory.push(newItem);
 if(n.armory[t.slot]===it.uid)n.armory[t.slot]=newItem.uid;
 return {ok:true,profile:n,item:newItem,cost,from:t.setTier,to:next.setTier};
}
function encounter(x,y,seed=0){const r=regionAt(x,y),kind=r.types[Math.abs(seed)%r.types.length],m=MOB_TYPES[kind];return {...m,id:'mob-'+kind,kind,region:r.id,name:m.name+' · '+r.name,hp:Math.round(m.hp*(1+r.min*.08)),level:r.min,telegraph:m.behavior,element:r.name};}
function explorationReward(p,mob,rand=Math.random){const n=sanitize(p),region=REGIONS.find(r=>r.id===mob.region)||REGIONS[0],xp=20+region.min*4;n.progress.xp+=xp;n.progress.level=Math.min(99,1+Math.floor(n.progress.xp/120));n.progress.monsters++;n.daily.hunt++;n.wallet.gold+=25+region.min*3;n.wallet.forge+=8+region.min;let item=null;if(rng(rand)<.4&&n.inventory.length<500){const pool=TEMPLATES.filter(t=>t.theme===region.id);item=makeItem(pool[Math.floor(rng(rand)*pool.length)].id,rng(rand)<.12?'blue':'green',rand);n.inventory.push(item);}return {ok:true,profile:n,xp,item};}

let serial=0;const uid=()=>`i${Date.now().toString(36)}${(serial++).toString(36)}`;
const template=id=>TEMPLATES.find(x=>x.id===id),rarity=id=>RARITIES.find(x=>x.id===id)||RARITIES[0],rng=fn=>Math.max(0,Math.min(.999999,typeof fn==='function'?+fn():Math.random()));
function makeItem(baseId,grade='white',rand=Math.random){const t=template(baseId);if(!t)return null;const level=rarity(grade).id,extras=[];if(level!=='white'){const available=AFFIXES.slice();for(let j=0;j<Math.min(2,RARITIES.findIndex(x=>x.id===level));j++){const i=Math.floor(rng(rand)*available.length);const a=available.splice(i,1)[0];const roll=a.min+(a.max-a.min)*rng(rand);extras.push({key:a.key,value:+roll.toFixed(3)});}}
 return {uid:uid(),baseId,rarity:level,level:0,extras,durability:100};}
function defaultProfile(){const basics=['iron_helm','iron_chest','iron_gloves','iron_boots','iron_pants','sword','shield','ring_flame','ring_flame_b','amulet','earring','bracelet','wolf'];const items=basics.map(id=>makeItem(id));const armory=Object.fromEntries(SLOT_LIST.map(([key])=>[key,null]));for(const item of items)armory[template(item.baseId).slot]=item.uid;
 const spare=['iron_helm','iron_helm','sword','sword','iron_chest','iron_chest'].map(id=>makeItem(id));return {version:6,wallet:{cash:0,gold:340,forge:160},materials:{ore:18,crystal:5},inventory:[...items,...spare],armory,progress:{xp:0,level:1,potions:3,monsters:0,mined:0,raidWins:0,score:0},position:{x:3,y:4},guild:{name:'',members:[],buff:0,points:0,history:[]},auction:{listings:[],sold:0},daily:{stamp:'',hunt:0,mines:0,completed:false},raidRecords:[]};}
function sanitize(p){if(!p||typeof p!=='object')return defaultProfile();const n=defaultProfile();for(const k of ['gold','forge'])n.wallet[k]=Math.max(0,Math.min(1e9,Math.floor(Number(p.wallet?.[k])||0)));n.wallet.cash=0;for(const k of ['ore','crystal'])n.materials[k]=Math.max(0,Math.min(1e9,Math.floor(Number(p.materials?.[k])||0)));
 n.inventory=Array.isArray(p.inventory)?p.inventory.filter(i=>i&&typeof i.uid==='string'&&template(i.baseId)&&RARITIES.some(r=>r.id===i.rarity)).slice(0,500).map(i=>({uid:i.uid,baseId:i.baseId,rarity:i.rarity,level:Math.max(0,Math.min(12,Math.floor(Number(i.level)||0))),extras:Array.isArray(i.extras)?i.extras.filter(a=>AFFIXES.some(x=>x.key===a.key)&&Number.isFinite(a.value)).slice(0,2).map(a=>({key:a.key,value:Math.max(0,Math.min(AFFIXES.find(x=>x.key===a.key).max,a.value))})):[],durability:Math.max(0,Math.min(100,Math.floor(Number(i.durability??100))))})):n.inventory;
 const valid=new Set(n.inventory.map(i=>i.uid));n.armory=Object.fromEntries(SLOT_LIST.map(([key])=>[key,null]));for(const [key] of SLOT_LIST){const id=p.armory?.[key];const it=n.inventory.find(i=>i.uid===id);if(valid.has(id)&&it&&template(it.baseId).slot===key)n.armory[key]=id;}
 if(n.armory.main){const main=n.inventory.find(i=>i.uid===n.armory.main);if(template(main.baseId).hands==='two')n.armory.off=null;}
 for(const k of ['xp','monsters','mined','raidWins','score'])n.progress[k]=Math.max(0,Math.min(1e9,Math.floor(Number(p.progress?.[k])||0)));n.progress.level=Math.min(99,Math.max(1,Math.floor(Number(p.progress?.level)||1)));n.progress.potions=Math.max(0,Math.min(999,Math.floor(Number(p.progress?.potions)||0)));
 n.position={x:Math.max(0,Math.min(95,Math.floor(Number.isFinite(p.position?.x)?p.position.x:3))),y:Math.max(0,Math.min(63,Math.floor(Number.isFinite(p.position?.y)?p.position.y:4)))};
 n.guild.name=typeof p.guild?.name==='string'?p.guild.name.slice(0,30):'';n.guild.members=Array.isArray(p.guild?.members)?p.guild.members.slice(0,12).map(x=>({id:String(x.id).slice(0,25),name:String(x.name).slice(0,30)})):[];n.guild.points=Math.max(0,Math.floor(Number(p.guild?.points)||0));n.guild.buff=Math.min(.12,Math.floor(n.guild.points/300)*.02);n.guild.history=Array.isArray(p.guild?.history)?p.guild.history.slice(-12):[];
 n.auction={listings:Array.isArray(p.auction?.listings)?p.auction.listings.filter(l=>valid.has(l.uid)&&Number.isFinite(l.price)&&l.price>0).slice(0,40).map(l=>({id:String(l.id),uid:l.uid,price:Math.floor(l.price)})):[],sold:Math.max(0,Math.floor(Number(p.auction?.sold)||0))};
 n.daily={stamp:typeof p.daily?.stamp==='string'?p.daily.stamp:'',hunt:Math.max(0,Math.floor(Number(p.daily?.hunt)||0)),mines:Math.max(0,Math.floor(Number(p.daily?.mines)||0)),completed:!!p.daily?.completed};n.raidRecords=Array.isArray(p.raidRecords)?p.raidRecords.slice(-10):[];return n;
}
function equip(p,uidValue){const n=sanitize(p),it=n.inventory.find(x=>x.uid===uidValue);if(!it)return {ok:false,reason:'Item indisponível'};const t=template(it.baseId);if(n.auction.listings.some(l=>l.uid===it.uid))return {ok:false,reason:'Item está no leilão'};const slot=t.slot;if(slot==='off'&&n.armory.main&&template(n.inventory.find(i=>i.uid===n.armory.main).baseId).hands==='two')return {ok:false,reason:'Uma arma de duas mãos bloqueia a mão secundária'};
 n.armory[slot]=it.uid;if(slot==='main'&&t.hands==='two')n.armory.off=null;return {ok:true,profile:n};}
function itemStats(it){const t=template(it.baseId),ri=RARITIES.findIndex(r=>r.id===it.rarity),m=1+ri*.35+it.level*.09,mod={};for(const [k,v] of Object.entries(t.mod))mod[k]=(mod[k]||0)+v*m;for(const a of it.extras)mod[a.key]=(mod[a.key]||0)+a.value;return mod;}
function stats(p){const n=sanitize(p),out={maxHp:0,maxFocus:0,attack:0,ability:0,regen:0,armor:0,perfect:0,dodgeBonus:0,guardBonus:0,burnPower:0,lifesteal:0,summonPower:0};for(const uidValue of Object.values(n.armory)){const i=n.inventory.find(x=>x.uid===uidValue);if(!i||!i.durability)continue;const mod=itemStats(i);for(const k in mod)out[k]=(out[k]||0)+mod[k]*i.durability/100;}
 const main=n.inventory.find(x=>x.uid===n.armory.main),off=n.inventory.find(x=>x.uid===n.armory.off);if(main&&off){const mh=template(main.baseId).hands,oh=template(off.baseId).hands;if(mh==='one'&&oh==='focus'){out.attack+=.08;out.ability+=.10;out.hybrid=true;}if(mh==='one'&&oh==='shield'){out.armor+=.04;out.guardBonus+=.12;}if(mh==='one'&&oh==='one'){out.attack+=.08;out.dodgeBonus+=.04;}}
 if(main&&template(main.baseId).hands==='two'){const t=template(main.baseId);out[t.mod.ability?'ability':'attack']+=.09;out.twoHanded=true;}
 for(const bonus of setBonuses(n)){if(!bonus.active)continue;for(const [key,value] of Object.entries(bonus.mod))out[key]=(out[key]||0)+value;}
 if(n.guild.name)out.attack+=(n.guild.buff||0);return out;}
function evolve(p,uidValue){const n=sanitize(p),it=n.inventory.find(i=>i.uid===uidValue);if(!it)return {ok:false,reason:'Item não encontrado'};if(it.level>=12)return {ok:false,reason:'Reforço máximo'};const ore=2+it.level*2,forge=12+it.level*6,gold=8+it.level*4;if(n.materials.ore<ore||n.wallet.forge<forge||n.wallet.gold<gold)return {ok:false,reason:`Precisa de ${ore} minério, ${forge} essência e ${gold} gold`};n.materials.ore-=ore;n.wallet.forge-=forge;n.wallet.gold-=gold;it.level++;it.durability=100;return {ok:true,profile:n,level:it.level};}
function fuse(p,a,b,rand=Math.random){const n=sanitize(p);if(a===b)return {ok:false,reason:'Escolha duas peças diferentes'};const x=n.inventory.find(i=>i.uid===a),y=n.inventory.find(i=>i.uid===b);if(!x||!y)return {ok:false,reason:'Itens inexistentes'};const rx=RARITIES.findIndex(r=>r.id===x.rarity);if(x.rarity!==y.rarity||rx>=4)return {ok:false,reason:'Use duas peças da MESMA raridade até lendário'};if(template(x.baseId).slot!==template(y.baseId).slot)return {ok:false,reason:'Fusão exige mesmo slot'};if(Object.values(n.armory).includes(a)||Object.values(n.armory).includes(b))return {ok:false,reason:'Desequipe as duas peças'};if(n.auction.listings.some(l=>l.uid===a||l.uid===b))return {ok:false,reason:'Retire as peças do leilão'};
 const cost=20*(rx+1)**2,ore=2+rx*4,crystal=rx>=2?rx-1:0;if(n.wallet.forge<cost||n.materials.ore<ore||n.materials.crystal<crystal)return {ok:false,reason:`Fusão requer ${cost} essência, ${ore} minério${crystal?', '+crystal+' cristal':''}`};n.wallet.forge-=cost;n.materials.ore-=ore;n.materials.crystal-=crystal;
 const roll=rng(rand),success=roll<RARITIES[rx].chance;
 // On failure one ingredient is destroyed, while the second is preserved.
 n.inventory=n.inventory.filter(i=>i.uid!==a&&(!success||i.uid!==b));let item=null;
 if(success){item=makeItem(x.baseId,RARITIES[rx+1].id,rand);n.inventory.push(item);}return {ok:true,profile:n,success,chance:RARITIES[rx].chance,roll,item,lost:success?2:1};}
function mine(p,node=0){const n=sanitize(p),ore=2+(node%3),crystal=node%4===0?1:0;n.materials.ore+=ore;n.materials.crystal+=crystal;n.wallet.forge+=4;n.progress.mined++;n.daily.mines++;return {ok:true,profile:n,ore,crystal,forge:4};}
function craftItem(p,baseId){const n=sanitize(p),t=template(baseId);if(!t)return {ok:false,reason:'Receita não encontrada'};if(t.setTier&&t.setTier!=='mortal')return {ok:false,reason:'Arch, Celestial e SubCelestial exigem ascensão de uma peça +9 da evolução anterior'};if(n.materials.ore<8||n.wallet.forge<18||n.wallet.gold<25)return {ok:false,reason:'Precisa de 8 minérios + 18 essências + 25 Gold'};n.materials.ore-=8;n.wallet.forge-=18;n.wallet.gold-=25;const item=makeItem(baseId,'white');n.inventory.push(item);return {ok:true,profile:n,item};}
function hunt(p){const n=sanitize(p);n.wallet.gold+=32;n.wallet.forge+=12;n.progress.monsters++;n.progress.xp+=25;n.progress.score+=90;n.daily.hunt++;n.progress.level=Math.min(99,1+Math.floor(n.progress.xp/120));return {ok:true,profile:n,gold:32,forge:12};}
function merchant(p,kind){const n=sanitize(p);if(kind==='potion'){if(n.wallet.gold<35)return {ok:false,reason:'Gold insuficiente'};n.wallet.gold-=35;n.progress.potions++;return {ok:true,profile:n};}
 if(kind==='repair'){let damaged=n.inventory.filter(i=>Object.values(n.armory).includes(i.uid)&&i.durability<100);if(!damaged.length)return {ok:false,reason:'Equipamento intacto'};const cost=damaged.reduce((sum,i)=>sum+Math.max(1,Math.ceil((100-i.durability)/3)),0);if(n.wallet.gold<cost)return {ok:false,reason:`Reparo custa ${cost} gold`};n.wallet.gold-=cost;damaged.forEach(i=>i.durability=100);return {ok:true,profile:n,cost};}return {ok:false,reason:'Serviço não encontrado'};}
function wear(p,amount=4){const n=sanitize(p);for(const uidValue of Object.values(n.armory)){const it=n.inventory.find(i=>i.uid===uidValue);if(it)it.durability=Math.max(0,it.durability-amount);}return n;}
function createGuild(p,name){const n=sanitize(p);const g=String(name||'').trim().replace(/\s+/g,' ').slice(0,30);if(g.length<3)return {ok:false,reason:'Nome do clã precisa de 3 caracteres'};if(n.guild.name)return {ok:false,reason:'Você já pertence a um clã'};n.guild.name=g;n.guild.members=[{id:'hero',name:'Você'}];return {ok:true,profile:n};}
function raidResult(p,bossHp,damages,bossId='boss'){const n=sanitize(p);const all=Object.entries(damages).filter(([name,dmg])=>name&&Number.isFinite(dmg)&&dmg>=0).map(([name,dmg])=>({name,damage:Math.floor(dmg)}));const sum=all.reduce((s,v)=>s+v.damage,0)||1;const rank=all.sort((a,b)=>b.damage-a.damage).map((v,i)=>({...v,rank:i+1,percent:+(v.damage/sum*100).toFixed(1),bossPercent:+(v.damage/bossHp*100).toFixed(1)}));const me=rank.find(x=>x.name==='Você')||{rank:rank.length+1,damage:0,percent:0};const participantGold=90+Math.max(0,6-me.rank)*15,participantForge=35+Math.max(0,5-me.rank)*6;let rareItem=null;if(me.rank===1){rareItem=makeItem('bracelet','blue');n.inventory.push(rareItem);}n.wallet.gold+=participantGold;n.wallet.forge+=participantForge;n.progress.score+=Math.round(me.damage*2+Math.max(0,6-me.rank)*100);n.progress.raidWins++;n.progress.xp+=100;n.progress.level=Math.min(99,1+Math.floor(n.progress.xp/120));n.guild.points+=n.guild.name?100:0;n.guild.buff=Math.min(.12,Math.floor(n.guild.points/300)*.02);const guildBonus=n.guild.name?30:0;n.wallet.gold+=guildBonus;
 const result={boss:BOSSES.find(b=>b.id===bossId)?.name||'Dragão do Eclipse',bossHp,rank,me,participantGold,participantForge,guildBonus,rareItem:rareItem?.baseId||null,guildBuff:n.guild.buff};n.raidRecords.push(result);n.raidRecords=n.raidRecords.slice(-10);if(n.guild.name)n.guild.history.push({boss:result.boss,points:100,rewards:participantGold+guildBonus,when:Date.now()});return {ok:true,profile:n,result};}
function listAuction(p,uidValue,price){const n=sanitize(p),item=n.inventory.find(i=>i.uid===uidValue),amount=Math.floor(Number(price));if(!item)return {ok:false,reason:'Item não encontrado'};if(Object.values(n.armory).includes(uidValue))return {ok:false,reason:'Desequipe antes de anunciar'};if(n.auction.listings.some(l=>l.uid===uidValue))return {ok:false,reason:'Item já anunciado'};if(!Number.isFinite(amount)||amount<10||amount>1e8)return {ok:false,reason:'Preço inválido'};n.auction.listings.push({id:'listing-'+uid(),uid:uidValue,price:amount});return {ok:true,profile:n};}
function cancelAuction(p,id){const n=sanitize(p),len=n.auction.listings.length;n.auction.listings=n.auction.listings.filter(l=>l.id!==id);return {ok:n.auction.listings.length<len,profile:n};}
// Offline has NO buyers. This function is for an authoritative backend when a real buyer pays in gold.
function serverSettleAuction(seller,buyer,id){const s=sanitize(seller),b=sanitize(buyer),listing=s.auction.listings.find(l=>l.id===id);if(!listing||b.wallet.gold<listing.price)return {ok:false,reason:'Sem saldo ou anúncio'};const it=s.inventory.find(i=>i.uid===listing.uid);if(!it)return {ok:false,reason:'Item ausente'};b.wallet.gold-=listing.price;s.wallet.gold+=Math.floor(listing.price*.95);s.auction.sold++;s.auction.listings=s.auction.listings.filter(l=>l.id!==id);s.inventory=s.inventory.filter(i=>i.uid!==it.uid);b.inventory.push({...it,uid:uid()});return {ok:true,seller:s,buyer:b,fee:listing.price-Math.floor(listing.price*.95)};}
function resetDaily(p,stamp){const n=sanitize(p);if(n.daily.stamp!==stamp)n.daily={stamp,hunt:0,mines:0,completed:false};return n;}
function dailyReward(p){const n=sanitize(p);if(n.daily.completed||n.daily.hunt<2||n.daily.mines<2)return {ok:false,reason:'Faça 2 caçadas e 2 minerações'};n.daily.completed=true;n.wallet.gold+=120;n.wallet.forge+=65;n.materials.crystal+=2;return {ok:true,profile:n};}
return {REGIONS,MOB_TYPES,regionAt,encounter,explorationReward,SET_TIERS,SET_FAMILIES,setBonuses,ascendSet,RARITIES,SLOT_LIST,TEMPLATES,AFFIXES,BOSSES,mapProps,template,rarity,makeItem,defaultProfile,sanitize,equip,itemStats,stats,evolve,fuse,mine,craftItem,hunt,merchant,wear,createGuild,raidResult,listAuction,cancelAuction,serverSettleAuction,resetDaily,dailyReward};
});
