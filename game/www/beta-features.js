/* Local presentation and offline trainer. Never submits training time as competitive XP. */
(function(){'use strict';
const V=window.ClashVisualCatalog,C=window.ClashTrainerCore;
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let prefs=read('laraBetaLookV1',{}),trainer=C.normalize(read('laraTrainerV2',null));
const reduced=()=>document.documentElement.classList.contains('calm-fx');
if(!['eco','balanced','high'].includes(prefs.quality))prefs.quality='balanced';
if(!Object.hasOwn(V.ELEMENTS,prefs.element))prefs.element='Fogo';
if(!Number.isInteger(prefs.model)||prefs.model<1||prefs.model>20)prefs.model=1;
if(!Number.isInteger(prefs.upgrade)||prefs.upgrade<0||prefs.upgrade>12)prefs.upgrade=0;
let voiceEnabled=false,lastVoice=-Infinity,imageKey='',sprite=null;
function className(){return RuneRPG.classById(RuneHero.get().classId).name;}
function budget(){return V.budget(prefs.upgrade,prefs.quality,reduced());}
function speak(){if(!voiceEnabled||document.hidden||performance.now()-lastVoice<2600)return;const s=ClashVoiceData.skills.find(s=>s.className===className()&&s.element===prefs.element);if(!s)return;lastVoice=performance.now();const p=ClashVoiceData.profiles[className()];
 if(window.NativeVoice){NativeVoice.speak(s.line,p.rate,p.pitch);return;}
 if(!window.speechSynthesis)return;const voice=speechSynthesis.getVoices().find(v=>v.localService&&/^pt/i.test(v.lang));if(!voice)return;const u=new SpeechSynthesisUtterance(s.line);u.voice=voice;u.lang='pt-BR';u.rate=p.rate;u.pitch=p.pitch;u.volume=.65;speechSynthesis.cancel();speechSynthesis.speak(u);
}
function drawHero(ctx,x,y,height){const name=className(),key=name+JSON.stringify(prefs)+reduced();if(key!==imageKey){imageKey=key;const next=new Image();next.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(V.armorSVG(name,prefs.element,prefs.upgrade,prefs.quality,reduced(),prefs.model).replace(/<text x="120" y="286"[\s\S]*?<\/text>/,''));sprite=next;}if(!sprite?.complete||!sprite.naturalWidth)return false;ctx.drawImage(sprite,x-height*.4,y-height*.88,height*.8,height);return true;}
function drawElement(ctx,size,age){
 const color=V.ELEMENTS[prefs.element].color;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;const r=size*.45;
 switch(prefs.element){
 case 'Fogo':for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*r*.55-r*.25,r*.4);ctx.lineTo(i*r*.55,-r*(i===0?1:.6));ctx.lineTo(i*r*.55+r*.25,r*.4);ctx.closePath();ctx.fill();}break;
 case 'Água':case 'Vento':for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,(k-1)*r*.3,r*(.5+k*.25),r*.25,age,0,prefs.element==='Água'?Math.PI*2:Math.PI*1.6);ctx.stroke();}break;
 case 'Raio':ctx.beginPath();ctx.moveTo(-r*.3,-r);ctx.lineTo(r*.35,-r*.1);ctx.lineTo(-r*.2,r*.1);ctx.lineTo(r*.4,r);ctx.stroke();break;
 case 'Terra':for(let i=0;i<4;i++)ctx.fillRect((i%2-.5)*r,-r*.5+Math.floor(i/2)*r*.6,r*.4,r*.4);break;
 case 'Gelo':for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(r,0);ctx.moveTo(r*.5,-r*.25);ctx.lineTo(r*.75,0);ctx.lineTo(r*.5,r*.25);ctx.stroke();ctx.restore();}break;
 case 'Luz':for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,r*(.4+k*.3),0,Math.PI*2);ctx.stroke();}break;
 case 'Sombra':for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3);ctx.beginPath();ctx.moveTo(-r*.2,0);ctx.quadraticCurveTo(r,-r,r*.3,r*.7);ctx.closePath();ctx.fill();ctx.restore();}break;
 }
}
window.LaraBeta={budget,speak,drawHero,drawElement,color:()=>V.ELEMENTS[prefs.element].color,reduced};
const modal=document.createElement('div');modal.className='screen hidden';modal.style.zIndex='90';modal.id='betaWorkshop';
modal.innerHTML=`<div class="panel workshop-root">
  <div class="modal-head">
    <div><p class="eyebrow">CLASH LARA · HERO STUDIO / OFICINA</p><h2>Seu herói, seu estilo</h2></div>
    <button class="xbtn" id="betaClose" aria-label="Fechar">×</button>
  </div>
  <p class="workshop-intro">Personalize seu personagem, acompanhe o treino individual das classes e proteja seu progresso.</p>
  <section class="workshop-panel" aria-label="Visualização do herói">
    <div class="workshop-section-title"><h3>✦ Aparência em tempo real</h3><span class="tag">100% COSMÉTICO</span></div>
    <div class="workshop-avatar">
      <div id="betaPreview" role="img" aria-label="Prévia da armadura selecionada"></div>
      <div class="workshop-avatar-caption">
        <strong id="betaAppearanceName">Duelista</strong>
        <span id="betaAppearanceElement">Fogo · +0</span>
        <span id="betaAppearanceModel">Modelo Batedor</span>
        <small>O visual muda na prévia e no combate. Equipamentos e atributos continuam independentes.</small>
      </div>
    </div>
    <div class="workshop-fields" style="margin-top:12px">
      <div class="workshop-field"><label for="betaElement">ELEMENTO</label><select id="betaElement"></select></div>
      <div class="workshop-field"><label for="betaModel">MODELO DE ARMADURA</label><select id="betaModel"></select></div>
      <div class="workshop-field"><label for="betaUpgrade">AURA / BRILHO</label><select id="betaUpgrade"></select></div>
      <div class="workshop-field"><label for="betaQuality">EFEITOS / DESEMPENHO</label><select id="betaQuality"><option value="eco">Eco</option><option value="balanced">Equilibrado</option><option value="high">Alto</option></select></div>
    </div>
    <button class="bigbutton secondary" id="betaVoice">ATIVAR FALAS</button>
    <small id="betaVoiceStatus">Falas utilizam a voz offline instalada no aparelho.</small>
  </section>
  <section class="workshop-panel" aria-label="Treinamento independente das classes">
    <div class="workshop-section-title"><h3>⚔ Treinamento por tempo</h3><span class="tag">NÍVEL 0–9</span></div>
    <div class="workshop-field"><label for="betaClass">CLASSE EM TREINAMENTO</label><select id="betaClass" aria-label="Classe em treinamento"></select></div>
    <p class="workshop-train-state" id="betaTrainState" aria-live="polite"></p>
    <div class="workshop-progress-track" role="progressbar" aria-label="Progresso do treino" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="betaTrainProgress"><span id="betaTrainFill"></span></div>
    <div class="workshop-cta-row">
      <button class="bigbutton" id="betaTrain">INICIAR CLASSE ESCOLHIDA</button>
      <button class="bigbutton secondary" id="betaPause">PAUSAR TREINO</button>
    </div>
    <p class="workshop-help">Evolução própria: 1h → 10h → 100h… Até 7 dias contabilizados por abertura. Não altera o XP de combate nem o ranking online.</p>
    <div id="betaLevels" class="notice" aria-label="Níveis de todas as classes"></div>
  </section>
  <details class="workshop-panel workshop-save" open>
    <summary>▤ Backup e transferência de save</summary>
    <p class="workshop-help">Copie seu save antes de trocar de aparelho. Importar substitui o progresso atual após confirmação.</p>
    <button class="bigbutton secondary" id="betaExport">EXPORTAR SAVE</button>
    <textarea id="betaSave" aria-label="Código de backup do save" rows="4" placeholder="Cole aqui o save completo para importar"></textarea>
    <button class="bigbutton secondary" id="betaImport">IMPORTAR SAVE COLADO</button>
    <p id="betaStatus" role="status" aria-live="polite"></p>
  </details>
  <p class="workshop-card-note">20 modelos por classe × 8 elementos × 13 auras. As 20.800 variantes são combinações visuais parametrizadas, não sprites únicos.</p>
</div>`;
document.body.append(modal);const $=id=>document.getElementById(id);
function options(id,values){for(const [value,label]of values){const o=document.createElement('option');o.value=value;o.textContent=label;$(id).append(o)}}
options('betaClass',C.CLASSES.map(c=>[c,c]));options('betaElement',Object.keys(V.ELEMENTS).map(c=>[c,c]));options('betaModel',V.PROFILES.map((n,i)=>[i+1,n]));options('betaUpgrade',Array.from({length:13},(_,i)=>[i,'+'+i]));
function persist(){write('laraTrainerV2',trainer)}
function refresh(){
 trainer=C.advance(trainer,Date.now());persist();const t=trainer.classes[trainer.selected];
 $('betaTrainState').textContent=(trainer.active?'Treinando '+trainer.active:'Treino pausado')+' · Seleção Nv. '+t.level+(t.level<C.MAX_LEVEL?' · '+(t.progressMs/C.HOUR).toFixed(2)+' / '+(C.cost(t.level)/C.HOUR).toLocaleString('pt-BR')+'h':' · máximo');
 $('betaLevels').textContent=C.CLASSES.map(c=>c+': '+trainer.classes[c].level).join(' · ');
 const progress=t.level>=C.MAX_LEVEL?100:Math.max(0,Math.min(100,t.progressMs/C.cost(t.level)*100));
 $('betaTrainFill').style.width=progress.toFixed(1)+'%';
 $('betaTrainProgress').setAttribute('aria-valuenow',String(Math.round(progress)));
}
function preview(){
 write('laraBetaLookV1',prefs);
 const name=className();
 $('betaPreview').innerHTML=V.armorSVG(name,prefs.element,prefs.upgrade,prefs.quality,reduced(),prefs.model);
 $('betaAppearanceName').textContent=name;
 $('betaAppearanceElement').textContent=prefs.element+' · Aura +'+prefs.upgrade;
 $('betaAppearanceModel').textContent='Modelo '+V.PROFILES[prefs.model-1];
 renderMenuHero();
}
function open(){$('betaStatus').textContent=window.RuneNetworkConnected?'Saia da sala para importar um save.':'';modal.classList.remove('hidden');$('betaClass').value=trainer.selected;for(const [id,key]of [['betaElement','element'],['betaModel','model'],['betaUpgrade','upgrade'],['betaQuality','quality']])$(id).value=prefs[key];refresh();preview();}
for(const parent of [document.querySelector('#welcome .panel'),document.querySelector('#settingsModal .panel')]){
 const b=document.createElement('button');b.className='bigbutton secondary';
 b.textContent='TREINO POR TEMPO · VISUAIS · VOZES';b.onclick=open;
 if(parent.closest('#welcome')){b.id='openHeroStudio';b.classList.add('workshop-entry');}
 parent.append(b);
}
// Reorganize existing actions without replacing the buttons or their game handlers.
const landing=document.querySelector('#welcome .panel'),heroMark=landing.querySelector('.hero-mark');
const primary=document.createElement('div');primary.className='menu-cta-primary';
landing.insertBefore(primary,$('heroBtn'));
for(const id of ['playBtn','openWorldBtn','heroBtn'])primary.append($(id));
const toolRow=document.createElement('div');toolRow.className='menu-tools';
landing.insertBefore(toolRow,landing.querySelector('.welcome-footnote'));
for(const id of ['trainBtn','introHelp','openHeroStudio'])toolRow.append($(id));
const liveStage=document.createElement('div');liveStage.className='menu-hero-stage';
heroMark.classList.add('has-hero-portrait');heroMark.append(liveStage);
let lastMenuRender='';
function renderMenuHero(){
 try{
  const name=className(),signature=[name,prefs.element,prefs.model,prefs.upgrade,prefs.quality,reduced()].join('/');
  if(signature===lastMenuRender)return;
  const svg=V.armorSVG(name,prefs.element,prefs.upgrade,prefs.quality,reduced(),prefs.model);
  liveStage.innerHTML=svg;
  const caption=document.createElement('span');caption.className='menu-hero-title';
  caption.textContent=name+' · '+prefs.element+' +'+prefs.upgrade;
  liveStage.append(caption);
  const colors=V.ELEMENTS[prefs.element];
  liveStage.style.setProperty('--stage-glow',colors.color+'55');
  lastMenuRender=signature;
 }catch(e){heroMark.classList.remove('has-hero-portrait');}
}
renderMenuHero();
$('betaClose').onclick=()=>modal.classList.add('hidden');
$('betaClass').onchange=()=>{trainer=C.select(trainer,$('betaClass').value,Date.now());refresh()};
$('betaTrain').onclick=()=>{trainer=C.startSelected(trainer,Date.now());refresh()};$('betaPause').onclick=()=>{trainer=C.advance(trainer,Date.now());trainer.active=null;refresh()};
for(const [id,key]of [['betaElement','element'],['betaModel','model'],['betaUpgrade','upgrade'],['betaQuality','quality']])$(id).onchange=()=>{prefs[key]=['model','upgrade'].includes(key)?Number($(id).value):$(id).value;preview()};
$('betaVoice').onclick=()=>{voiceEnabled=!voiceEnabled;if(window.NativeVoice)NativeVoice.enable(voiceEnabled);if(!voiceEnabled)window.speechSynthesis?.cancel();$('betaVoice').textContent=voiceEnabled?'DESATIVAR FALAS':'ATIVAR FALAS';$('betaVoiceStatus').textContent=window.NativeVoice&&!NativeVoice.available()?'Nenhuma voz offline em português pronta. Instale-a nas configurações de voz do Android e reabra o jogo.':'Falas '+(voiceEnabled?'ativadas':'desativadas');speak()};
const keys=['laraRuneProfileV5','laraRuneWorldV6','laraRuneCustomV1','laraRuneBestV1','laraTrainerV2','laraBetaLookV1'];
$('betaExport').onclick=()=>{refresh();const data={format:'lara-save-1',values:{}};for(const k of keys){const v=localStorage.getItem(k);if(v!==null)data.values[k]=v;}const code=JSON.stringify(data);$('betaSave').value=code;$('betaSave').select();if(window.NativeBackup)NativeBackup.share(code);$('betaStatus').textContent='Save preparado. Guarde o texto completo.';};
$('betaImport').onclick=()=>{try{if(window.RuneNetworkConnected)throw Error('Saia da sala antes de importar.');const raw=$('betaSave').value;if(raw.length>500000)throw Error('Save muito grande.');const data=JSON.parse(raw);if(data.format!=='lara-save-1'||!data.values||typeof data.values!=='object')throw Error('Formato inválido.');const safe={};for(const k of keys)if(Object.hasOwn(data.values,k)){if(typeof data.values[k]!=='string')throw Error('Valor inválido.');JSON.parse(data.values[k]);safe[k]=data.values[k];}if(!Object.keys(safe).length)throw Error('Save vazio.');if(!confirm('Substituir o progresso deste aplicativo pelo save colado?'))return;
 const previous={};for(const k of keys)previous[k]=localStorage.getItem(k);
 // Backup is written before mutation; if storage quota or I/O fails during import,
 // restore every managed key so a partial import cannot corrupt progression.
 write('laraSaveBeforeImport',previous);
 try{
  for(const k of keys){if(k in safe)localStorage.setItem(k,safe[k]);else localStorage.removeItem(k);}
 }catch(importError){
  try{
   // Free any newly imported space before restoring the original snapshot.
   for(const k of keys)localStorage.removeItem(k);
   for(const k of keys)if(previous[k]!==null)localStorage.setItem(k,previous[k]);
  }catch(restoreError){
   throw Error('Falha ao importar e restaurar automaticamente. Backup disponível em laraSaveBeforeImport; não limpe os dados do app.');
  }
  throw Error('Falha ao gravar o save; progresso anterior restaurado.');
 }
 location.reload();}catch(e){$('betaStatus').textContent=e.message;}};
setInterval(()=>{if(!document.hidden){if(!modal.classList.contains('hidden'))refresh();else{trainer=C.advance(trainer,Date.now());persist();}if(!document.querySelector('#welcome').classList.contains('hidden'))renderMenuHero();}},5000);
document.addEventListener('visibilitychange',()=>{trainer=C.advance(trainer,Date.now());persist();if(document.hidden){if(window.NativeVoice)NativeVoice.stop();window.speechSynthesis?.cancel();}});
refresh();
})();
