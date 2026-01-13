const { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, Notification, ipcMain } = require('electron')
const path = require('path')

let win
let tray

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const isDev = !app.isPackaged
  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }

  win.on('close', (e) => {
    if (tray) {
      e.preventDefault()
      win.hide()
    }
  })
}

function setupTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)
  const menu = Menu.buildFromTemplate([
    { label: 'Open TickTick', click: () => win.show() },
    { label: 'Quit', click: () => app.quit() }
  ])
  tray.setToolTip('TickTick Desktop')
  tray.setContextMenu(menu)
  tray.on('double-click', () => win.show())
}

function setupShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (!win) return
    win.isVisible() ? win.hide() : win.show()
  })
}

app.whenReady().then(() => {
  createWindow()
  setupTray()
  setupShortcuts()

  new Notification({ title: 'TickTick', body: 'App started' }).show()
})

ipcMain.on('notify', (_e, { title, body }) => {
  new Notification({ title, body }).show()
})

app.on('will-quit', () => globalShortcut.unregisterAll())
