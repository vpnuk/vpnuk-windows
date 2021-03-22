const { app, BrowserWindow } = require('electron');
const path = require('path');
const { killWindowsProcessSync } = require('./src/utils/openVpn');
const ElectronStore = require('electron-store');
ElectronStore.initRenderer();
const AppTray = require('./mainExt/tray');

let window, pid, tray;

const isDev = process.env.ELECTRON_ENV === 'Dev';
exports.isDev = isDev;

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
    exports.window = window;

    if (isDev) {
        window.loadURL('http://localhost:3000/');
        window.webContents.openDevTools();
    } else {
        window.loadURL('file:///' + path.join(__dirname, './build/index.html'));
    }

    window.on('close', event => {
        isDev && console.log('window-close event');
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

app.on('ready', () => {
    createWindow();
    tray = new AppTray(() => window.focus());
    exports.tray = tray;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    tray.destroy();
});

app.on('activate', () => {
    if (window === null) {
        createWindow();
    }
});

const setPid = value => pid = value;
exports.setPid = setPid;

require('./mainExt/handlers');