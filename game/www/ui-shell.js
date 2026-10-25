/* Arcane HUD: presentation and guided interactions. Does not modify combat rules. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.RuneShell=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const RUNE_INFO=Object.freeze({
 R:{name:'CORTE',symbol:'→',description:'Ataque direto. É a maneira mais rápida de causar dano e iniciar sequências.',combo:'→ →  ·  Lâminas Gêmeas'},
 U:{name:'RUPTURA',symbol:'↑',description:'Golpe ascendente que rompe o escudo do inimigo antes de atacar.',combo:'↑ →  ·  Ruptura'},
 D:{name:'GUARDA',symbol:'↓',description:'Proteção temporária. O tempo certo cria uma aparada perfeita e devolve energia.',combo:'↓ →  ·  Riposta'},
 L:{name:'ESQUIVA',symbol:'←',description:'Deslocamento evasivo. Se usado no instante do ataque, melhora a recompensa.',combo:'← ↑  ·  Passo Relâmpago'},
 O:{name:'ARCANO',symbol:'○',description:'Magia circular que ignora parte das defesas e utiliza 10 pontos de energia.',combo:'○ →  ·  Lâmina Arcana'}

});
const ENEMY_NAME=Object.freeze({raider:'SAQUEADOR',shaman:'FEITICEIRO',armored:'SENTINELA',boss:'GUARDIÃO'});
const COACH_CODES=Object.freeze(['R','U','D','L','O']);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function deriveBattleUX(s){
 const enemies=Array.isArray(s.enemies)?s.enemies:[];
 const target=enemies[clamp(s.selected||0,0,Math.max(enemies.length-1,0))]||null;
 const danger=enemies.filter(e=>e.stun<=0).slice().sort((a,b)=>a.cooldown-b.cooldown)[0];
 let label='LEITURA DA ARENA',action='SELECIONE UM INIMIGO',countdown='—',charge=0,urgent=false;
 if(s.mode==='menu'){label='COMBATE ARCANO';action='PRONTO PARA COMEÇAR';}
 else if(!enemies.length){label='ARENA LIVRE';action='PRÓXIMA ONDA';}
 else if(danger){
  countdown=Math.max(0,danger.cooldown).toFixed(1)+'s';charge=clamp((1-danger.cooldown/3.0)*100,0,100);urgent=danger.cooldown<1.15;
  if(urgent){label=danger.type==='shaman'?'MAGIA HOSTIL':'ATAQUE IMINENTE';action=danger.type==='shaman'&&s.focus>=16?'USE ↑ OU ○ PARA INTERROMPER':s.guardReady?'DESENHE ↓ PARA APARAR':s.dodgeReady?'DESENHE ← PARA ESQUIVAR':'PREPARE O CONTRA-ATAQUE';}
  else if(target&&target.shield>0){label='ALVO PROTEGIDO';action='DESENHE ↑ PARA ROMPER';}
  else if(target&&target.stun>0){label='ABERTURA CRÍTICA';action='COMBO AGORA!';}
  else if(s.focus<16){label='ENERGIA BAIXA';action='ATAQUE COM → PARA RECUPERAR';}
  else{label='ALVO MARCADO';action='ENCADEIE SUAS RUNAS';}
 }
 return {label,action,countdown,charge,urgent,targetCount:enemies.length,targetType:target?.type||null,selected:clamp(s.selected||0,0,Math.max(enemies.length-1,0))};
}
function createUI({onTarget,onRune}){
 const $=id=>document.getElementById(id),rail=$('targetRail'),widget=$('threat-widget'),coach=$('coachWidget');
 let signature='',coachIndex=0,coachComplete=false,lastMode='menu',currentWave=0;
 const targetButtons=[];
 for(const b of document.querySelectorAll('[data-rune]'))b.addEventListener('click',()=>onRune(b.dataset.rune));
 rail.addEventListener('click',e=>{const btn=e.target.closest('[data-slot]');if(btn&&rail.contains(btn))onTarget(Number(btn.dataset.slot));});
 function syncTargets(s,ux){
  const sig=(s.enemies||[]).map(e=>e.id+':'+e.type).join('|');
  if(sig!==signature){signature=sig;rail.replaceChildren();targetButtons.length=0;
   (s.enemies||[]).forEach((enemy,i)=>{const b=document.createElement('button'),dot=document.createElement('span'),title=document.createElement('span'),hp=document.createElement('small');b.type='button';b.className='target-token '+enemy.type;b.dataset.slot=i;dot.className='target-dot';title.className='target-title';title.textContent=ENEMY_NAME[enemy.type]||'INIMIGO';b.append(dot,title,hp);rail.append(b);targetButtons.push({b,hp});});
  }
  targetButtons.forEach(({b,hp},i)=>{const e=s.enemies[i];b.classList.toggle('selected',i===ux.selected);b.setAttribute('aria-pressed',String(i===ux.selected));b.setAttribute('aria-label',`Selecionar ${ENEMY_NAME[e.type]||'inimigo'} com ${Math.round(100*e.hp/Math.max(1,e.maxHp))}% de vida`);hp.textContent=Math.max(0,Math.ceil(100*e.hp/Math.max(1,e.maxHp)))+'%';});
 }
 function syncCoach(mode){
  if(mode!==lastMode){lastMode=mode;if(mode==='training'){coachIndex=0;coachComplete=false;}}
  const active=mode==='training';coach.classList.toggle('hidden',!active);if(!active)return;
  $('coachStep').textContent=coachComplete?'✓ 5/5':`${coachIndex+1}/6`;
  $('coachPrompt').textContent=coachComplete?'RUNAS DOMINADAS! Experimente criar combos.':`Desenhe ${RUNE_INFO[COACH_CODES[coachIndex]].symbol} · ${RUNE_INFO[COACH_CODES[coachIndex]].name.toLowerCase()}`;
  $('coachFill').style.width=(coachComplete?100:coachIndex/5*100)+'%';
 }
 function gesture(code){if(lastMode!=='training'||coachComplete)return; if(code===COACH_CODES[coachIndex]){coachIndex++;coachComplete=coachIndex===5;syncCoach('training');}}
 function inspectRune(code){const rune=RUNE_INFO[code];if(!rune)return;$('runeDetailIcon').textContent=rune.symbol;$('runeDetailName').textContent=rune.name;$('runeDetailDesc').textContent=rune.description;$('runeDetailExample').textContent=rune.combo;}
 function render(s){const ux=deriveBattleUX(s);$('arenaWave').textContent=String(s.wave||1).padStart(2,'0');$('threatName').textContent=ux.label;$('threatAction').textContent=ux.action;$('threatCountdown').textContent=ux.countdown;$('threatFill').style.width=ux.charge.toFixed(1)+'%';widget.classList.toggle('urgent',ux.urgent);syncTargets(s,ux);syncCoach(s.mode);$('streakText').textContent=`✦ ${s.perfectCount||0} PERFEITOS`;return ux;}
 return {render,gesture,inspectRune,resetCoach:()=>{coachIndex=0;coachComplete=false;lastMode='menu';}};
}
return {deriveBattleUX,createUI,RUNE_INFO,ENEMY_NAME,COACH_CODES};
});
