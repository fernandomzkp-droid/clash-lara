const assert=require('node:assert/strict'),{lanOrigin}=require('./lan-policy.cjs');
assert.equal(lanOrigin('https://192.168.1.23:8787/'),'https://192.168.1.23:8787');
for(const x of ['http://192.168.1.23:8787/','https://example.com/','https://offline.runeclash.local/','https://192.168.1.23:8787/x'])assert.equal(lanOrigin(x),null,x);
console.log('Windows LAN navigation policy: PASS');
