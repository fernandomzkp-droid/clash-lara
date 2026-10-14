'use strict';
const assert=require('node:assert/strict');const C=require('./trainer_core');const H=C.HOUR;let n=0;function t(label,fn){fn();n++;console.log('PASS',label)}
t('safe cost for every available level',()=>{for(let i=0;i<C.MAX_LEVEL;i++)assert(Number.isSafeInteger(C.cost(i)))});
t('invalid cost rejected',()=>assert.throws(()=>C.cost(C.MAX_LEVEL)));
t('sequential x10 cost',()=>{for(let i=0;i<C.MAX_LEVEL-1;i++)assert.equal(C.cost(i+1),10*C.cost(i))});
t('legacy over-max migrates to supported cap',()=>{const s=C.normalize({version:2,classes:{Monge:{level:12,progressMs:9e15}}},0);assert.equal(s.classes.Monge.level,C.MAX_LEVEL);assert.equal(s.classes.Monge.progressMs,0)});
t('fractional timestamps normalized',()=>{let s=C.create(0);s.active='Monge';s=C.advance(s,H+.9);assert.equal(s.classes.Monge.level,1);assert.equal(s.classes.Monge.progressMs,0)});
t('start selected without losing previous class progress',()=>{let s=C.create(0);s=C.startSelected(s,0);s=C.select(s,'Arcanista',H);s=C.startSelected(s,H);s=C.advance(s,2*H);assert.equal(s.classes.Duelista.level,1);assert.equal(s.classes.Arcanista.level,1)});
t('same timestamp idempotence',()=>{let s=C.startSelected(C.create(0),0);s=C.advance(s,H);assert.deepEqual(C.advance(s,H),s)});
t('no backwards accrual',()=>{let s=C.startSelected(C.create(0),100);s=C.advance(s,50);assert.equal(s.classes.Duelista.progressMs,0)});
console.log('TOTAL',n,'PASSED');
