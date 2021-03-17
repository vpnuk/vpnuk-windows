const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { killWindowsProcessSync } = require('./src/utils/openVpn');
const ElectronStore = require('electron-store');
ElectronStore.initRenderer();

let window, pid;
const isDev = process.env.ELECTRON_ENV === 'Dev';

function createWindow() {
    window = new BrowserWindow({
        width: isDev ? 1280 : 720,
        height: 960,
        icon: path.join(__dirname, './public/favicon.ico'),
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });

    if (isDev) {
        window.loadURL('http://localhost:3000/');
        window.webContents.openDevTools();
    } else {
        window.loadURL(url.format({
            pathname: path.join(__dirname, './build/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    window.on('close', event => {
        isDev && console.log('window-close event')
        if (pid) {
            killWindowsProcessSync(pid);
            pid = null;
        }
        isDev && event.preventDefault();
    });

    window.on('closed', () => {
        window = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (window === null) {
        createWindow();
    }
});

require('./mainHandlers');