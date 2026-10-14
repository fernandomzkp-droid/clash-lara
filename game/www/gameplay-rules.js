/* Clash Lara: deterministic, dependency-free rules; shared by mobile and tests. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.RuneRules=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const DIFFICULTIES=Object.freeze({
   casual:Object.freeze({name:'Casual',attackRate:.76,damageRate:.65,healthRate:.80,focusRegen:4.8}),
   normal:Object.freeze({name:'Normal',attackRate:1,damageRate:1,healthRate:1,focusRegen:3.6}),
   intense:Object.freeze({name:'Intenso',attackRate:1.22,damageRate:1.28,healthRate:1.12,focusRegen:3.6})
 });
 function safeDifficulty(id){return Object.hasOwn(DIFFICULTIES,id)?id:'normal'}
 function enemyCooldown(wave,difficulty,rand=0,boss=false){const d=DIFFICULTIES[safeDifficulty(difficulty)];return (Math.max(1.45,3.15-wave*.11)+Math.max(0,rand)*.8+(boss?.2:0))/d.attackRate}
 function enemyDamage(base,difficulty,training){return training?0:Math.max(1,Math.round(base*DIFFICULTIES[safeDifficulty(difficulty)].damageRate))}
 function enemyHealth(base,difficulty){return Math.max(1,Math.round(base*DIFFICULTIES[safeDifficulty(difficulty)].healthRate))}
 function shamanDrain(wave,difficulty){return Math.max(1,Math.round((10+wave*.75)*DIFFICULTIES[safeDifficulty(difficulty)].damageRate))}
 function canFight(mode){return mode==='playing'||mode==='training'}
 function transitions(mode,next){return ({menu:['playing','training'],playing:['over','playing','training','menu'],training:['over','playing','training','menu'],over:['playing','training','menu']})[mode]?.includes(next)===true}
 return {DIFFICULTIES,safeDifficulty,enemyCooldown,enemyDamage,enemyHealth,shamanDrain,canFight,transitions};
});
