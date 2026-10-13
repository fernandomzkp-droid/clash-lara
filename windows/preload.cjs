'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('LaraDesktop',Object.freeze({connectLAN:url=>ipcRenderer.invoke('connect-lan',url),goHome:()=>ipcRenderer.invoke('go-home')}));
