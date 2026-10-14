/* Clash Lara core: deterministic recognition and sequence evaluation. */
(function(root,factory){ const api=factory(); if(typeof module !== 'undefined' && module.exports) module.exports=api; root.RuneCore=api; })(typeof globalThis !== 'undefined'?globalThis:this,function(){
 'use strict';
 const glyphs={R:{icon:'→',name:'Corte'},U:{icon:'↑',name:'Ascensão'},D:{icon:'↓',name:'Guarda'},L:{icon:'←',name:'Esquiva'},O:{icon:'○',name:'Arcano'},Z:{icon:'ϟ',name:'Raio'}};
 const defaults=[
  {seq:'RR',name:'Lâminas Gêmeas',damage:24,effect:'damage',description:'Dois cortes, explosão de dano'},
  {seq:'UR',name:'Ruptura',damage:21,effect:'break',description:'Rompe armadura e ataca'},
  {seq:'DR',name:'Riposta',damage:19,effect:'shield',description:'Escudo seguido de contragolpe'},
  {seq:'LU',name:'Passo Relâmpago',damage:19,effect:'dodge',description:'Desvia e atordoa brevemente'},
  {seq:'OR',name:'Lâmina Arcana',damage:28,effect:'burn',description:'Corte com queimadura'},
  {seq:'ZR',name:'Choque Cortante',damage:25,effect:'stun',description:'Interrompe a conjuração'},
  {seq:'RUR',name:'Dança de Lâminas',damage:43,effect:'area',description:'Três ataques com dano em área'},
  {seq:'DLR',name:'Fantasma Defensor',damage:34,effect:'shield',description:'Defesa e contra-ataque veloz'},
  {seq:'OZR',name:'Tempestade Rúnica',damage:47,effect:'stun',description:'Raio arcano e paralisia'},
  {seq:'OOZR',name:'Eclipse',damage:70,effect:'nova',description:'Explosão de quatro símbolos'}
 ];
 function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
 function resample(input,n=40){
   if(!input || input.length<2) return [];
   let pts=input.map(p=>({x:p.x,y:p.y})), len=0;
   for(let i=1;i<pts.length;i++) len+=distance(pts[i],pts[i-1]);
   if(len<0.1) return [];
   const out=[{...pts[0]}],step=len/(n-1); let accum=0,idx=1;
   while(idx<pts.length && out.length<n){
    const a=pts[idx-1],b=pts[idx],d=distance(a,b);
    if(d<.001){idx++;continue}
    if(accum+d>=step){const t=(step-accum)/d,q={x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)};out.push(q);pts.splice(idx,0,q);idx++;accum=0}
    else{accum+=d;idx++}
   }
   while(out.length<n)out.push({...pts[pts.length-1]});
   return out;
 }
 function normalized(input){ const p=resample(input,40);if(!p.length)return[];
   let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
   p.forEach(q=>{minX=Math.min(minX,q.x);maxX=Math.max(maxX,q.x);minY=Math.min(minY,q.y);maxY=Math.max(maxY,q.y)});
   const d=Math.max(maxX-minX,maxY-minY,1);return p.map(q=>({x:(q.x-minX)/d,y:(q.y-minY)/d}));
 }
 const zTemplate=normalized([{x:0,y:0},{x:100,y:0},{x:0,y:100},{x:100,y:100}]);
 function classify(points){
   if(!points||points.length<2)return null;
   const p=resample(points,40);if(!p.length)return null;
   let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,total=0;
   p.forEach((q,i)=>{minX=Math.min(minX,q.x);maxX=Math.max(maxX,q.x);minY=Math.min(minY,q.y);maxY=Math.max(maxY,q.y);if(i)total+=distance(q,p[i-1])});
   const w=maxX-minX,h=maxY-minY,diag=Math.hypot(w,h),start=p[0],end=p[p.length-1];
   if(diag<23 || total<28)return null;
   const closure=distance(start,end)/diag;
   if(w>26&&h>26&&w/h>.50&&w/h<1.95&&closure<.37&&total/diag>2.15){
     const c=p.reduce((a,q)=>({x:a.x+q.x/p.length,y:a.y+q.y/p.length}),{x:0,y:0});
     let angle=0;
     for(let i=1;i<p.length;i++){
       let a=Math.atan2(p[i-1].y-c.y,p[i-1].x-c.x),b=Math.atan2(p[i].y-c.y,p[i].x-c.x),diff=b-a;
       if(diff>Math.PI)diff-=Math.PI*2;if(diff< -Math.PI)diff+=Math.PI*2;angle+=diff;
     }
     if(Math.abs(angle)>=Math.PI*1.62){const quality=Math.min(1,.63+Math.min(.22,(.37-closure)*.6)+Math.min(.15,(Math.abs(angle)/(2*Math.PI)-.75)*.6));return {code:'O',quality:+quality.toFixed(3)}}
   }
   // Angular shape matching is only used for deliberate three-segment Z strokes.
   if(w>31&&h>26&&w/h>.55&&w/h<2.5&&total/diag>2.05&&closure>.4){
     const q=normalized(points);let err=0;
     for(let i=0;i<q.length;i++)err+=distance(q[i],zTemplate[i]);err/=q.length;
     if(err<.24){return {code:'Z',quality:+Math.min(1,.77+(0.24-err)*1.05).toFixed(3)}}
   }
   const dx=end.x-start.x,dy=end.y-start.y,direct=Math.hypot(dx,dy);
   if(direct<31||direct/total<.71)return null;
   let code=null, dominance=0;
   if(Math.abs(dx)>Math.abs(dy)*1.40){code=dx>0?'R':'L';dominance=Math.abs(dx)/direct}
   else if(Math.abs(dy)>Math.abs(dx)*1.40){code=dy>0?'D':'U';dominance=Math.abs(dy)/direct}
   if(!code)return null;
   const quality=Math.min(1,.55*(direct/total)+.45*dominance);
   return {code,quality:+quality.toFixed(3)};
 }
 function checkCombo(recent, allCombos, now){
   if(!recent.length)return null;
   const ordered=allCombos.slice().sort((a,b)=>b.seq.length-a.seq.length || (b.custom?1:0)-(a.custom?1:0));
   for(const combo of ordered){
     const n=combo.seq.length, part=recent.slice(-n);
     if(part.length!==n || part.map(x=>x.code).join('')!==combo.seq)continue;
     if(part.some((s,i)=>i>0&&(s.time-part[i-1].time)>1450))continue;
     if(now-part[0].time>7200)continue;
     const avg=part.reduce((a,s)=>a+s.quality,0)/n;
     const fast=part.every((s,i)=>i===0 || (s.time-part[i-1].time>=100 && s.time-part[i-1].time<=1120));
     const perfect=avg>=.875 && part.every(s=>s.quality>=.80) && fast;
     return {...combo,perfect,accuracy:+avg.toFixed(3)};
   }
   return null;
 }
 // Longest *anchored* prefix wins: never fire UR during R→U→R.
 // No buffering beyond a valid sequence: short combos still fire on second gesture.
 function advanceCombo(previous, allCombos, newGlyph, now){
   if(!newGlyph||!/^[RUDLOZ]$/.test(newGlyph.code))return {sequence:[],combo:null,pending:false};
   const fresh=(previous||[]).filter((p,i,a)=>now-p.time<=7200 && (i===a.length-1 || a[i+1].time-p.time<=1450));
   let source=[...fresh,newGlyph].slice(-6);
   if(source.length>1&&source[source.length-1].time-source[source.length-2].time>1450)source=[newGlyph];
   // Search from oldest possible command; fall back to suffix only after it is invalid.
   for(let off=0;off<source.length;off++){
     const part=source.slice(off),text=part.map(x=>x.code).join('');
     const candidate=allCombos.filter(c=>c.seq.startsWith(text));
     if(!candidate.length)continue;
     const finished=candidate.find(c=>c.seq===text);
     if(finished){
       const combo=checkCombo(part,[finished],now);
       return {sequence:[],combo,pending:false};
     }
     return {sequence:part,combo:null,pending:true};
   }
   return {sequence:[],combo:null,pending:false};
 }
 function prefixConflict(seq,combos){return combos.find(c=>seq.startsWith(c.seq)||c.seq.startsWith(seq))||null}
 function customPower(seq,effect){
   const n=seq.length,unique=new Set(seq).size,changes=[...seq].filter((v,i)=>i>0&&v!==seq[i-1]).length;
   const chain=Math.max(0,n-unique),diversity=Math.min(1.12,.63+.37*Math.min(1,unique/4)+Math.min(.12,changes*.025));
   const premium={damage:0,stun:6,heal:8,burn:4,shield:4,area:12}[effect]||0;
   const mastery=unique>=4&&changes>=3;
   return {damage:Math.round((16+n*n*3.8)*diversity),cost:Math.max(0,(n-2)*8+chain*4+premium),perfectMultiplier:mastery?1.65:1.5,mastery};
 }
 return {glyphs,defaults,resample,classify,checkCombo,advanceCombo,customPower,prefixConflict};
});
