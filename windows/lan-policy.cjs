'use strict';
function lanOrigin(raw){try{const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')return null;let h=u.hostname.toLowerCase();if(h.endsWith('.local')&&h!=='offline.runeclash.local')return u.origin;let a=h.split('.');if(a.length!==4)return null;const n=a.map(Number);if(n.some((v,i)=>!/^\d{1,3}$/.test(a[i])||!Number.isInteger(v)||v>255))return null;if(n[0]===10||(n[0]===172&&n[1]>=16&&n[1]<=31)||(n[0]===192&&n[1]===168)||n[0]===127)return u.origin;return null}catch{return null}}
module.exports={lanOrigin};
