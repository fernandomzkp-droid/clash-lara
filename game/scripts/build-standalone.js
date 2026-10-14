const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'www');
let html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dir,'design-system.css'),'utf8').replaceAll('</style','<\/style');
html=html.replace('<link rel="stylesheet" href="./design-system.css">',`<style>\n${css}\n</style>`);
for(const file of ['engine-core.js','gameplay-rules.js','rpg-system.js','rpg-ui.js','ui-shell.js','world-art.js','game.js','world-domain.js','world-ui.js','world-start.js','world-online.js','trainer-core.js','visual-catalog.js','voice-data.js','beta-features.js']){
  const script=fs.readFileSync(path.join(dir,file),'utf8').replaceAll('</script','<\/script');
  const old=`<script src="./${file}"></script>`;
  if(!html.includes(old))throw Error('Script tag absent: '+file);
  html=html.replace(old,`<script>\n${script}\n</script>`);
}
// The one-file edition must have no external assets, requests or installation UI.
html=html.replace(/<link rel="manifest"[^>]*>/g,'').replace(/<link rel="icon"[^>]*>/g,'').replace(/<link rel="apple-touch-icon"[^>]*>/g,'');
const output=path.join(root,'LARA_RUNE_CLASH_OFFLINE.html');fs.writeFileSync(output,html);console.log('Standalone generated:',output);
