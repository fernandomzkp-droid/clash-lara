const assert=require('node:assert/strict');const R=require('../www/gameplay-rules.js'),C=require('../www/engine-core.js');
assert.deepEqual(Object.keys(R.DIFFICULTIES),['casual','normal','intense']);
assert.equal(R.safeDifficulty('__proto__'),'normal');assert.equal(R.safeDifficulty('oops'),'normal');
for(const mode of ['casual','normal','intense']){for(let wave=1;wave<=50;wave++){const t=R.enemyCooldown(wave,mode,.2);assert.ok(t>.95 && Number.isFinite(t));const hp=R.enemyHealth(100,mode);assert.ok(hp>=1);assert.ok(R.enemyDamage(25,mode,false)>=1);assert.equal(R.enemyDamage(25,mode,true),0);}}
assert.ok(R.enemyCooldown(5,'casual')>R.enemyCooldown(5,'normal'));
assert.ok(R.enemyCooldown(5,'normal')>R.enemyCooldown(5,'intense'));
assert.equal(R.shamanDrain(5,'casual')>0,true);assert.ok(R.shamanDrain(5,'intense')>R.shamanDrain(5,'casual'));assert.equal(R.transitions('playing','menu'),true);assert.equal(R.transitions('menu','over'),false);assert.equal(R.transitions('menu','training'),true);assert.equal(R.transitions('over','training'),true);assert.equal(R.transitions('training','over'),true);assert.equal(R.canFight('over'),false);assert.equal(R.canFight('training'),true);
assert.ok(C.customPower('RUOZDL','area').damage>C.customPower('RRRRRR','area').damage);assert.ok(C.customPower('RUOZDL','area').cost<C.customPower('RRRRRR','area').cost);assert.equal(C.customPower('RUOZDL','damage').perfectMultiplier,1.65);assert.equal(C.customPower('RRRRRR','damage').perfectMultiplier,1.5);
console.log('Rules: 3 difficulties x 50 waves, modes, no-damage training PASS');
