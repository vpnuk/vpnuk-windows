const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const pkg = require('./package.json')

let window

function createWindow() {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  })

  if (pkg.DEV) {
    window.loadURL('http://localhost:3000/')
    window.webContents.openDevTools()
  } else {
    console.log('__dirname', __dirname)
    window.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  window.on('closed', () => {
    window = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (window === null) {
    createWindow()
  }
})