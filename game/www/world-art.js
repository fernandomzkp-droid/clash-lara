/* Lightweight procedural textures, silhouettes and spells. No external assets. */
(function(root){'use strict';
function polygon(c,pts,fill,stroke){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.2;c.stroke();}}
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function mob(c,kind,x,y,size,color,time=0){if(root.LaraBeta?.reduced())time=0;c.save();c.translate(x,y);c.scale(size/40,size/40);const t=time/1000;oval(c,0,22,29,7,'#0007');c.translate(0,Math.sin(t*2)*2);c.lineJoin='round';const grad=c.createLinearGradient(-20,-40,25,20);grad.addColorStop(0,color);grad.addColorStop(1,'#182332');
 if(kind==='slime'){oval(c,0,5,29,22,grad);oval(c,-10,-5,8,4,'#ffffff55');}
 else if(kind==='wolf'||kind==='drake'){polygon(c,[[-28,12],[-18,-13],[9,-18],[24,-5],[29,9],[13,20],[-15,20]],grad,color);polygon(c,[[-10,-14],[-6,-38],[5,-17],[16,-30],[20,-8]],color);polygon(c,[[20,10],[39,1],[30,20]],color);if(kind==='drake'){polygon(c,[[-15,4],[-48,-33],[-39,9],[-18,17]],'#9d485d',color);polygon(c,[[10,3],[41,-35],[40,13],[13,20]],'#9d485d',color);}}
 else if(kind==='spider'||kind==='beetle'){c.strokeStyle=color;c.lineWidth=4;for(let i=0;i<4;i++)for(const sign of [-1,1]){c.beginPath();c.moveTo(sign*12,-12+i*9);c.lineTo(sign*(29+i%2*6),-23+i*14);c.lineTo(sign*40,-14+i*14+Math.sin(t*4+i)*3);c.stroke();}oval(c,0,2,20,28,grad);polygon(c,[[0,-21],[15,-9],[12,20],[0,28],[-13,18],[-15,-8]],color,'#fff6');c.strokeStyle='#192b35';c.beginPath();c.moveTo(0,-21);c.lineTo(0,25);c.stroke();}
 else if(kind==='wisp'||kind==='shaman'){polygon(c,[[0,-36],[-22,20],[-11,15],[0,28],[13,14],[26,21]],grad,color);if(kind==='shaman'){polygon(c,[[-28,-13],[0,-48],[26,-13]],color);c.strokeStyle='#d9bfa0';c.lineWidth=4;c.beginPath();c.moveTo(31,-27);c.lineTo(27,28);c.stroke();oval(c,31,-29,7,7,'#e9dbff');}else{c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.ellipse(0,0,33,13,t,0,Math.PI*2);c.stroke();}}
 else if(['treant','cyclops','gargoyle','lich','bandit'].includes(kind)){
  polygon(c,[[-23,-21],[-12,-35],[12,-35],[23,-18],[26,20],[8,29],[-23,21]],grad,color);
  polygon(c,[[-25,-21],[-42,-9],[-29,20],[-20,10]],color);
  polygon(c,[[25,-21],[42,-9],[31,22],[20,10]],color);
  if(kind==='treant'){for(const sign of [-1,1]){c.strokeStyle='#8cc779';c.lineWidth=5;c.beginPath();c.moveTo(sign*8,-30);c.lineTo(sign*14,-46);c.lineTo(sign*26,-50);c.stroke();}}
  if(kind==='cyclops')oval(c,0,-14,10,8,'#fff0c0');
  if(kind==='gargoyle'){polygon(c,[[-14,-10],[-44,-32],[-32,5],[-13,14]],'#63728f',color);polygon(c,[[14,-10],[44,-32],[32,5],[13,14]],'#63728f',color);}
  if(kind==='lich'){polygon(c,[[-17,-30],[0,-54],[16,-30]],'#30224d',color);oval(c,0,-13,7,6,'#99eafa');}
  if(kind==='bandit'){polygon(c,[[-23,-24],[0,-46],[24,-23]],'#453f43',color);}
 }
 else if(['harpy','phoenix','gryphon'].includes(kind)){
  polygon(c,[[-10,-6],[-49,-38],[-41,16],[-15,20]],color,'#f2e2ca');
  polygon(c,[[10,-6],[49,-38],[41,16],[15,20]],color,'#f2e2ca');
  oval(c,0,0,15,24,grad);polygon(c,[[0,-42],[18,-20],[0,-10],[-16,-20]],color);
  if(kind==='phoenix'){for(const sign of [-1,1])polygon(c,[[sign*20,-10],[sign*45,-48],[sign*50,7]],'#ffbd59');}
 }
 else if(['scorpion','basilisk','siren','wraith'].includes(kind)){
  if(kind==='scorpion'){for(const sign of [-1,1])for(let i=0;i<3;i++){c.strokeStyle=color;c.lineWidth=4;c.beginPath();c.moveTo(sign*11,-10+i*11);c.lineTo(sign*30,-22+i*18);c.stroke();}}
  polygon(c,[[-20,-19],[9,-30],[29,-14],[23,14],[0,28],[-22,17]],grad,color);
  polygon(c,[[12,4],[45,-20],[35,20]],color);
  if(kind==='basilisk')for(const sign of [-1,1])polygon(c,[[sign*8,-23],[sign*19,-51],[sign*21,-18]],color);
  if(kind==='siren'){c.strokeStyle='#bdf8ff';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(0,5,20+i*8,0,Math.PI*1.6);c.stroke();}}
  if(kind==='wraith'){c.globalAlpha=.75;oval(c,0,-12,17,16,'#a19aff77');c.globalAlpha=1;}
 }
 else{polygon(c,[[-18,-22],[17,-24],[26,10],[12,26],[-17,24],[-28,6]],grad,color);polygon(c,[[-19,-19],[-12,-39],[14,-38],[21,-18]],grad,color);polygon(c,[[-19,-13],[-36,-6],[-31,19],[-20,14]],color);polygon(c,[[20,-13],[33,-7],[35,20],[22,14]],color);if(kind==='skeleton'){for(let i=0;i<4;i++){c.strokeStyle='#19212e';c.lineWidth=2;c.beginPath();c.moveTo(-11,-9+i*7);c.lineTo(11,-9+i*7);c.stroke();}}}
 // Stable etched texture, not random noise each frame.
 c.globalAlpha=.25;for(let i=0;i<12;i++){const xx=((i*17)%29)-14,yy=((i*11)%31)-14;c.strokeStyle=i%2?'#ffffff':'#101822';c.lineWidth=1;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+6,yy-3);c.stroke();}c.globalAlpha=1;oval(c,-7,-12,3,3,'#ffe7a2');oval(c,7,-12,3,3,'#ffe7a2');c.restore();}
const tiles=new Map();function tile(region,x,y,size){const variant=Math.abs((x*31+y*17)%8),key=region.id+':'+variant+':'+size;if(tiles.has(key))return tiles.get(key);const a=document.createElement('canvas');a.width=a.height=size;const c=a.getContext('2d');c.fillStyle=region.color;c.fillRect(0,0,size,size);for(let i=0;i<20;i++){const xx=(i*17+variant*7)%size,yy=(i*29+variant*3)%size;c.fillStyle=i%2?'#00000014':region.accent+'22';c.fillRect(xx,yy,2+i%5,1+i%3);}if(variant<3){polygon(c,[[9,25],[17,8],[25,25]],region.accent+'66');polygon(c,[[15,30],[23,12],[31,30]],region.accent+'44');}
 if(variant===3||variant===6){c.strokeStyle=region.accent+'77';c.lineWidth=2;c.beginPath();c.arc(size*.6,size*.65,size*.18,0,Math.PI*1.5);c.stroke();}
 if(variant===4){c.fillStyle='#152e33b0';c.beginPath();c.ellipse(size*.5,size*.7,size*.37,size*.13,.35,0,Math.PI*2);c.fill();c.fillStyle='#b7d0c355';c.fillRect(size*.45,size*.48,3,2);}
 if(region.id==='desert'||region.id==='ice'){c.strokeStyle=region.accent+'55';c.lineWidth=1.5;for(let n=0;n<3;n++){c.beginPath();c.moveTo((n*11+variant*3)%size,size*.65+n*6);c.quadraticCurveTo(size*.45,size*.6+n*7,size*.9,size*.65+n*7);c.stroke();}}
tiles.set(key,a);return a;}
function hero(c,x,y,color,time=0){if(root.LaraBeta?.reduced())time=0;c.save();c.translate(x,y);oval(c,0,12,14,5,'#0008');polygon(c,[[-8,-9],[-15,12],[0,8],[12,14],[8,-12]],color+'88');polygon(c,[[-9,-13],[8,-13],[11,7],[-10,7]],'#435773',color);oval(c,0,-20,7,8,'#e5c1a5');polygon(c,[[-8,-23],[0,-32],[8,-23]],color);c.strokeStyle='#d8faff';c.lineWidth=3;c.beginPath();c.moveTo(10,1);c.lineTo(22,-18+Math.sin(time/250));c.stroke();c.restore();}
function spell(c,kind,x,y,size,age,color){const a=Math.max(0,age);c.save();c.translate(x,y);c.strokeStyle=color;c.fillStyle=color;c.lineWidth=3;c.shadowColor=color;c.shadowBlur=12;
 if(kind==='shock'){c.beginPath();for(let i=0;i<7;i++){const yy=-size/2+i*size/6,xx=(i%2?1:-1)*size*.12;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}
 else if(kind==='slash'){c.rotate(-.7);for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,0,size*.7,size*(.14+i*.07),0,0,Math.PI);c.stroke();}}
 else if(kind==='burn'){for(let i=0;i<5;i++){const xx=(i-2)*size*.16;polygon(c,[[xx-7,12],[xx+Math.sin(a*10+i)*8,-size*(.3+i%2*.2)],[xx+9,12]],color);}}
 else if(kind==='heal'){for(let i=0;i<4;i++){c.save();c.translate(Math.cos(i*1.57)*size*.35,Math.sin(i*1.57)*size*.35-a*12);c.fillRect(-3,-9,6,18);c.fillRect(-9,-3,18,6);c.restore();}}
 else{for(let j=0;j<2;j++){c.save();c.rotate(a*(j?1:-1));c.beginPath();for(let i=0;i<6;i++){const b=i*Math.PI/3,xx=Math.cos(b)*size*(.3+j*.2),yy=Math.sin(b)*size*(.3+j*.2);i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();c.stroke();c.restore();}c.beginPath();c.arc(0,0,size*.62,0,Math.PI*2);c.stroke();}c.restore();}
function equipment(c,slot,x,y,size,color,style=0){c.save();c.translate(x,y);c.scale(size/24,size/24);const grad=c.createLinearGradient(-15,-15,15,15);grad.addColorStop(0,color);grad.addColorStop(.45,'#51687c');grad.addColorStop(1,'#182232');if(['chest','pants','gloves','boots','helm'].includes(slot)){if(slot==='helm')polygon(c,[[-14,9],[-16,-6],[-9,-17],[0,-12],[9,-17],[16,-6],[14,9],[6,4],[0,10],[-6,4]],grad,color);else if(slot==='chest')polygon(c,[[-18,-12],[-9,-18],[0,-12],[9,-18],[18,-12],[12,-3],[10,18],[-10,18],[-12,-3]],grad,color);else polygon(c,[[-11,-15],[11,-15],[14,13],[0,19],[-14,13]],grad,color);c.strokeStyle=color;c.lineWidth=1;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-9,-8+i*4);c.lineTo(0,-5+i*4);c.lineTo(9,-8+i*4);c.stroke();}polygon(c,[[0,-7],[5,0],[0,7],[-5,0]],style%2?'#f3c986':'#b7faff');}else if(slot==='main'){polygon(c,[[-3,13],[-4,-14],[0,-28],[5,-14],[3,13]],grad,'#dcf8ff');polygon(c,[[-12,10],[12,10],[9,15],[-9,15]],color);c.fillStyle='#c6a179';c.fillRect(-3,15,6,10);}else if(slot==='off'){polygon(c,[[-17,-14],[0,-20],[17,-14],[13,9],[0,24],[-13,9]],grad,color);polygon(c,[[0,-12],[8,0],[0,13],[-8,0]],color);}else{c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.ellipse(0,0,14,18,style*.3,0,Math.PI*2);c.stroke();polygon(c,[[0,-22],[7,-14],[0,-5],[-7,-14]],color,'#e6f8ff');}c.restore();}
root.RuneArt={mob,tile,hero,spell,equipment};
})(globalThis);
