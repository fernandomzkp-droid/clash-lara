'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const V=require('../www/visual-catalog'),C=require('../www/trainer-core');
let n=0;for(const name of V.CLASS_NAMES)for(let m=1;m<=20;m++)for(const e of Object.keys(V.ELEMENTS))for(let u=0;u<=12;u++){const r=V.renderPlan({className:name,model:m,element:e,upgrade:u});assert.equal(r.armorId,V.getArmor(name,m).id);assert.match(r.svgFallback,/<svg/);n++;}
assert.equal(n,20800);assert.equal(V.budget(12,'high',true).particles,0);assert.throws(()=>V.renderPlan({className:'<script>'}));
const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../www/voice-data.js'),'utf8'),scope);const data=scope.window.ClashVoiceData;assert.equal(data.skills.length,80);assert.equal(new Set(data.skills.map(s=>s.id)).size,80);for(const s of data.skills){assert(V.CLASS_NAMES.includes(s.className));assert(V.ELEMENTS[s.element]);assert(s.cooldownVoiceMs>=2600);}
const overflow=C.normalize({version:2,classes:{Duelista:{level:8,progressMs:Number.MAX_SAFE_INTEGER}}},0);assert.equal(overflow.classes.Duelista.level,9);
assert.equal(fs.readFileSync(path.join(__dirname,'../www/trainer-core.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../server/tab-s7/trainer_core.js'),'utf8'));
console.log('PASS 20800 visual variants, 80 voices, reduced motion, trainer overflow and shared core');
