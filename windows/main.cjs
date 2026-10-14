'use strict';
const {app,BrowserWindow,Menu,ipcMain}=require('electron');
const path=require('node:path');const {pathToFileURL,fileURLToPath}=require('node:url');
const {lanOrigin}=require('./lan-policy.cjs');
let win;
const contentRoot=()=>app.isPackaged?path.join(process.resourcesPath,'www'):path.join(__dirname,'www');
const launcher=()=>path.join(contentRoot(),'index.html');
function home(){if(!win||win.isDestroyed())return;win.__allowedOrigin='';return win.loadFile(launcher());}
function create(){win=new BrowserWindow({width:460,height:890,minWidth:375,minHeight:650,backgroundColor:'#081223',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,preload:path.join(__dirname,'preload.cjs')}});win.__allowedOrigin='';win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(url.startsWith('file://')){let file;try{file=fileURLToPath(url);}catch{event.preventDefault();return;}const root=contentRoot();if(!file.startsWith(root+path.sep)&&file!==launcher())event.preventDefault();return;}let origin;try{origin=new URL(url).origin;}catch{event.preventDefault();return;}if(!win.__allowedOrigin||origin!==win.__allowedOrigin)event.preventDefault();});
 win.webContents.on('will-redirect',(event,url)=>{try{if(new URL(url).origin!==win.__allowedOrigin)event.preventDefault();}catch{event.preventDefault();}});
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Jogo',submenu:[{label:'Tela inicial',accelerator:'CmdOrCtrl+Shift+H',click:home},{role:'quit'}]},{label:'Exibir',submenu:[{role:'reload'},{role:'togglefullscreen'}]}]));home();}
app.whenReady().then(()=>{ipcMain.handle('connect-lan',async(event,url)=>{if(!win||event.sender!==win.webContents||event.senderFrame?.url!==pathToFileURL(launcher()).href)return false;const origin=lanOrigin(url);if(!origin)return false;win.__allowedOrigin=origin;try{await win.loadURL(origin+'/');return true;}catch{win.__allowedOrigin='';await home();return false;}});ipcMain.handle('go-home',event=>{if(!win||event.sender!==win.webContents)return false;home();return true;});create();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)create();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
