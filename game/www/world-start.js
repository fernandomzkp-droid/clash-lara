/* Rune Realms local UI bootstrapping, isolated from the existing V5 engine. */
(function(){'use strict';
const key='laraRuneWorldV6';let current;function read(){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function save(p){current=p;try{localStorage.setItem(key,JSON.stringify(p));window.dispatchEvent(new Event('rune-world-updated'))}catch{}}
let world=window.RuneWorldUI.createHub({save,onStats:()=>{}});document.getElementById('openWorldBtn').addEventListener('click',()=>world.open(read()));
window.LaraRuneWorld={open:()=>world.open(read()),get:()=>window.RuneWorld.sanitize(read()),hub:world};
})();
