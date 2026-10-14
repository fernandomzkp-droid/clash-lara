/* Clash Lara trainer core v10.2: deterministic, no browser dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.ClashTrainerCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const CLASSES=Object.freeze(['Duelista','Arcanista','Sentinela','Caçador','Assassino','Invocador','Clérigo','Berserker','Monge','Elementalista']);
const HOUR=3600000,MAX_LEVEL=9,MAX_CLOCK_DELTA=7*24*HOUR;
const finite=(n,fallback=0)=>typeof n==='number'&&Number.isFinite(n)?n:fallback;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function cost(level){if(!Number.isInteger(level)||level<0||level>=MAX_LEVEL)throw Error('invalid level');const v=HOUR*10**level;if(!Number.isSafeInteger(v))throw Error('unsafe level cost');return v;}
function create(now=Date.now()){return {version:2,active:null,selected:CLASSES[0],lastSync:Math.max(0,finite(now)),clockWarnings:0,classes:Object.fromEntries(CLASSES.map(n=>[n,{level:0,progressMs:0}]))};}
function normalize(raw,now=Date.now()){
 const s=create(now);if(!raw||typeof raw!=='object'||![1,2].includes(raw.version))return s;
 s.active=CLASSES.includes(raw.active)?raw.active:null;s.selected=CLASSES.includes(raw.selected)?raw.selected:CLASSES[0];
 s.lastSync=clamp(Math.floor(finite(raw.lastSync,s.lastSync)),0,Number.MAX_SAFE_INTEGER);
 s.clockWarnings=clamp(Math.floor(finite(raw.clockWarnings)),0,1e6);
 for(const n of CLASSES){const r=raw.classes&&raw.classes[n];if(!r||typeof r!=='object')continue;
 let level=clamp(Math.floor(finite(r.level)),0,MAX_LEVEL),progressMs=clamp(Math.floor(finite(r.progressMs)),0,Number.MAX_SAFE_INTEGER);
 if(level===MAX_LEVEL)progressMs=0;
 else {while(level<MAX_LEVEL&&progressMs>=cost(level)){progressMs-=cost(level);level++;}if(level===MAX_LEVEL)progressMs=0;}
 s.classes[n]={level,progressMs};}
 return s;
}
function advance(state,now){
 const s=normalize(state,now);const t=clamp(Math.floor(finite(now,s.lastSync)),0,Number.MAX_SAFE_INTEGER);
 if(t<s.lastSync){s.clockWarnings++;return s;} // Preserve lastSync; rollback cannot accrue again.
 let delta=t-s.lastSync;
 if(delta>MAX_CLOCK_DELTA){s.clockWarnings++;delta=MAX_CLOCK_DELTA;}
 s.lastSync=t;
 if(!s.active||delta<=0)return s;
 const x=s.classes[s.active];while(delta>0&&x.level<MAX_LEVEL){const remain=cost(x.level)-x.progressMs;if(delta>=remain){delta-=remain;x.level++;x.progressMs=0;}else{x.progressMs+=delta;delta=0;}}
 return s;
}
function select(state,name,now){if(!CLASSES.includes(name))throw Error('invalid class');const s=advance(state,now);s.selected=name;return s;}
function toggle(state,now){const s=advance(state,now);s.active=s.active?null:s.selected;return s;}
function startSelected(state,now){const s=advance(state,now);s.active=s.selected;return s;}
return Object.freeze({CLASSES,HOUR,MAX_LEVEL,MAX_CLOCK_DELTA,cost,create,normalize,advance,select,toggle,startSelected});
});
