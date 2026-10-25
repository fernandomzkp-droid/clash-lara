'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true});try{const page=await browser.newPage({viewport:{width:412,height:915},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'../LARA_RUNE_CLASH_OFFLINE.html'));
await page.locator('#welcome .menu-hero-stage svg').waitFor();
assert.equal(await page.locator('#welcome .menu-cta-primary #playBtn').count(),1);
assert.equal(await page.locator('#welcome .menu-tools #openHeroStudio').count(),1);
await page.screenshot({path:'entrega/menu-visual-0.9.1.png'});
await page.getByRole('button',{name:'TREINO POR TEMPO · VISUAIS · VOZES'}).first().click();
await page.locator('#betaWorkshop .workshop-avatar svg').waitFor();
await page.screenshot({path:'entrega/oficina-visual-0.9.1.png'});
assert.equal(await page.locator('#betaTrainProgress').getAttribute('aria-valuemin'),'0');await page.selectOption('#betaClass','Arcanista');await page.click('#betaTrain');await page.selectOption('#betaElement','Gelo');await page.selectOption('#betaModel','20');await page.selectOption('#betaUpgrade','12');assert.match(await page.locator('#betaTrainState').textContent(),/Treinando Arcanista/);assert.match(await page.locator('#betaAppearanceElement').textContent(),/Gelo · Aura \+12/);assert.match(await page.locator('#welcome .menu-hero-title').textContent(),/Gelo \+12/);await page.click('#betaClose');await page.reload();await page.getByRole('button',{name:'TREINO POR TEMPO · VISUAIS · VOZES'}).first().click();assert.equal(await page.inputValue('#betaElement'),'Gelo');assert.match(await page.locator('#betaTrainState').textContent(),/Treinando Arcanista/);await page.click('#betaPause');await page.click('#betaExport');assert.equal(JSON.parse(await page.inputValue('#betaSave')).format,'lara-save-1');
// Regression: failed storage write after earlier keys changed must restore all original values.
const original=await page.evaluate(()=>Object.fromEntries(['laraRuneProfileV5','laraRuneWorldV6','laraRuneCustomV1','laraRuneBestV1','laraTrainerV2','laraBetaLookV1'].map(k=>[k,localStorage.getItem(k)])));
const importData=JSON.parse(await page.inputValue('#betaSave'));
importData.values.laraBetaLookV1=JSON.stringify({...JSON.parse(importData.values.laraBetaLookV1),element:'Raio'});
await page.locator('#betaSave').fill(JSON.stringify(importData));
await page.evaluate(()=>{
 const orig=Storage.prototype.setItem;let blocked=false;
 Storage.prototype.setItem=function(k,v){if(k==='laraBetaLookV1'&&!blocked){blocked=true;throw new DOMException('Quota reached','QuotaExceededError');}return orig.call(this,k,v);};
 window.restoreSetItem=()=>{Storage.prototype.setItem=orig;};
});
page.once('dialog',async d=>d.accept());
await page.click('#betaImport');
assert.match(await page.locator('#betaStatus').textContent(),/progresso anterior restaurado/);
const restored=await page.evaluate(()=>{restoreSetItem();return Object.fromEntries(['laraRuneProfileV5','laraRuneWorldV6','laraRuneCustomV1','laraRuneBestV1','laraTrainerV2','laraBetaLookV1'].map(k=>[k,localStorage.getItem(k)]))});
assert.deepEqual(restored,original);
await page.click('#betaClose');await page.click('#openWorldBtn');await page.waitForTimeout(300);await page.screenshot({path:'entrega/mundo-beta.png'});await page.click('#worldClose');await page.click('#playBtn');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>LaraBeta.budget().particles),0);await page.screenshot({path:'entrega/combate-beta.png'});assert.deepEqual(errors,[]);console.log('PASS browser mobile: trainer persistence, cosmetics, backup export, world, combat, no runtime errors');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
