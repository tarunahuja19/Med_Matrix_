const { contextBridge, ipcMain } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  uploadKspaceFile: () => window.ipcRenderer?.invoke('upload-kspace-file'),
})
