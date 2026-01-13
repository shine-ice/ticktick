const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ticktick', {
  notify(title, body) {
    ipcRenderer.send('notify', { title, body })
  }
})
