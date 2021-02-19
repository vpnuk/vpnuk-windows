const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const pkg = require('./package.json')

let win

function createWindow () {
  win = new BrowserWindow({width: 800, height: 600, webPreferences: {webSecurity: false, nodeIntegration: true, nodeIntegrationInWorker: true}})

  if(pkg.DEV){
    win.loadURL('http://localhost:3000/')
  }else{
    console.log('__dirname', __dirname)
    win.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})