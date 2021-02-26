const { app, BrowserWindow } = require('electron');
const isDevelopment = require('electron-is-dev');
const path = require('path');
const url = require('url');

let window;

const killWindowsProcess = (pid) => {
  var code = require('child_process')
    .spawnSync('taskkill', [`/PID\ ${pid}\ /T\ /F`], { shell: true })
    .exitCode;
  console.log(`kill process PID=${pid} result=${code}`);
}

function createWindow() {
  window = new BrowserWindow({
    width: isDevelopment ? 1280 : 720,
    height: 960,
    icon: path.join(__dirname, './public/favicon.ico'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  });

  window.currentConnection = null;
  
  if (isDevelopment) {
    window.loadURL('http://localhost:3000/');
    window.webContents.openDevTools();
  } else {
    window.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  window.on('close', (event) => {
    if (isDevelopment) {
      console.log(window.currentConnection);
    }
    if (window.currentConnection) {
      killWindowsProcess(window.currentConnection.pid);
    }
    if (isDevelopment) {
      event.preventDefault();
    }
  });

  window.on('closed', () => {
    window = null;
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
})