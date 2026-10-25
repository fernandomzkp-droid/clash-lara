const assert = require('node:assert/strict');
const R = require('../www/engine-core.js');
function trace(vertices, noise=0, seed=1){const out=[];let x=seed;const rand=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296};for(let i=1;i<vertices.length;i++){const a=vertices[i-1],b=vertices[i];for(let j=0;j<22;j++){const t=j/22;out.push({x:a[0]*(1-t)+b[0]*t+(rand()-.5)*noise,y:a[1]*(1-t)+b[1]*t+(rand()-.5)*noise})}}out.push({x:vertices.at(-1)[0],y:vertices.at(-1)[1]});return out}
function getGlyph(c, noise=0, seed=1){const map={R:[[8,55],[120,55]],L:[[120,55],[8,55]],U:[[60,112],[60,10]],D:[[60,10],[60,112]],Z:[[6,10],[116,10],[7,108],[118,108]]};if(c==='O'){const pts=[];for(let i=0;i<=52;i++){const a=(i/52)*Math.PI*2,rand=(Math.sin(seed*i*17.35))*noise*.25;pts.push({x:65+(42+rand)*Math.cos(a),y:65+(42+rand)*Math.sin(a)})}return pts}return trace(map[c],noise,seed)}
let counts={};for(let c of 'RLUDO'){
 let pass=0,total=80;
 for(let i=0;i<total;i++){let got=R.classify(getGlyph(c,(i%8)*.65+1,i+1));if(got&&got.code===c)pass++}
 counts[c]=pass;assert.ok(pass>=76,`${c} ${pass}/${total}`)
}
for(let c of 'RLUDO'){const got=R.classify(getGlyph(c));assert.equal(got?.code,c);assert.ok(got.quality>.7,`${c} quality ${got.quality}`)}
assert.equal(R.classify([{x:1,y:1},{x:2,y:2}]),null);
const g=(code,time,quality)=>({code,time,quality});
let c=R.checkCombo([g('R',0,.96),g('R',550,.95)],R.defaults,550);assert.equal(c.name,'Lâminas Gêmeas');assert.equal(c.perfect,true);
c=R.checkCombo([g('R',0,.73),g('R',700,.95)],R.defaults,700);assert.equal(c.perfect,false);
c=R.checkCombo([g('R',0,.96),g('R',1700,.96)],R.defaults,1700);assert.equal(c,null);
const power=R.customPower('RUOLR','stun');assert.ok(power.damage>R.customPower('RUO','damage').damage);assert.ok(power.cost>0);
assert.equal(new Set(R.defaults.map(c=>c.seq)).size,R.defaults.length);
assert.equal(R.prefixConflict('RRU',R.defaults).seq,'RR');
assert.equal(R.prefixConflict('UULO',R.defaults),null);
assert.equal(R.classify(getGlyph('Z')),null,'zigzag no longer a required glyph');
assert.ok(R.defaults.filter(c=>c.seq.length===6).length>=4);
console.log('Gesture recognition synthetic samples (80 per symbol):',counts);
console.log('Combo resolution, perfect timing, anti-spam, customization: PASS');
