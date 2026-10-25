const assert=require('node:assert/strict');
const C=require('../www/engine-core.js');
const g=(code,time,quality=.98)=>({code,time,quality});
function play(chars,custom=[],step=350){let state=[],hits=[];chars.split('').forEach((ch,i)=>{const t=i*step;const r=C.advanceCombo(state,[...custom,...C.defaults],g(ch,t),t);state=r.sequence;if(r.combo)hits.push(r.combo.name)});return {hits,state}}
assert.deepEqual(play('RR').hits,['Lâminas Gêmeas']);
assert.deepEqual(play('UR').hits,['Ruptura']);
assert.deepEqual(play('RUR').hits,['Dança de Lâminas'],'UR suffix may NOT steal RUR');
assert.deepEqual(play('OOLR').hits,['Eclipse'],'OUL suffix may NOT steal OOLR');
assert.deepEqual(play('OUL').hits,['Tempestade Rúnica']);
assert.deepEqual(play('DLR').hits,['Fantasma Defensor']);
assert.deepEqual(play('RURR').hits,['Dança de Lâminas']);
const custom=[{name:'Selo do Alba',seq:'RUOUL',damage:100,custom:true}];
assert.deepEqual(play('RUOUL',custom).hits,['Selo do Alba'],'OUL suffix may NOT steal custom');
assert.deepEqual(play('DULO', [{name:'Tempestade Tripla',seq:'DULO'}]).hits,['Tempestade Tripla']);
assert.deepEqual(play('RUR',[],1600).hits,[],'timed out strokes cannot complete');
let x=C.advanceCombo([g('R',0),g('U',250)],C.defaults,g('R',530),530);
assert.equal(x.combo?.perfect,true);
x=C.advanceCombo([g('R',0),g('U',250)],C.defaults,g('R',530,.5),530);
assert.equal(x.combo?.perfect,false);
assert.equal(C.advanceCombo([],C.defaults,g('Q',0),0).combo,null);
assert.equal(C.advanceCombo([],C.defaults,g('Z',0),0).pending,false);
for(const seq of ['RLODUD','LUDORL','DROULR','UDOLOR','OLDRUO']){
 assert.ok(play(seq,[],700).hits.length>=1,`combo 6 gestures should work within 4 s: ${seq}`);
 assert.equal(play(seq,[],830).hits.some(n=>C.defaults.find(c=>c.name===n)?.seq===seq),false,`combo over 4 s not valid: ${seq}`);
}
assert.ok(C.defaults.length>=30,'major skill expansion');
console.log('Sequence arbiter: 12 coverage groups PASS');
