const { app, BrowserWindow } = require('electron');
const path = require('path');
const AppTray = require('./tray');
const { enableAutoUpdate } = require("./updater");
const ElectronStore = require('electron-store');
ElectronStore.initRenderer();

const isDev = process.env.ELECTRON_ENV === 'Dev';
exports.isDev = isDev;

let window, tray;

function createWindow() {
    window = new BrowserWindow({
        width: isDev ? 1280 : 720,
        height: 960,
        icon: path.join(__dirname, '../../public/favicon.ico'),
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });
    exports.window = window;

    !isDev && window.removeMenu()
    isDev && window.webContents.openDevTools();
    window.loadURL(isDev
        ? 'http://localhost:3000/'
        : 'file:///' + path.join(__dirname, '../../build/index.html'));

    window.on('close', event => {
        isDev && console.log('window-close event');
        const { closeConnectionSync } = require('./handlers');
        if (!closeConnectionSync()) {
            isDev && console.log('window-close event cancelled');
            event.preventDefault();
        }
    });

    window.on('closed', () => {
        isDev && console.log('window-closed event');
        window = null;
    });
}

const gotTheLock = app.requestSingleInstanceLock()

if (gotTheLock) {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (window) {
            if (window.isMinimized()) window.restore()
            window.focus()
        }
    })

    app.on('ready', () => {
        createWindow();
        tray = new AppTray(() => window.focus());
        exports.tray = tray;
        enableAutoUpdate();
    });

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
}
else {
    app.quit();
}

isDev && process.on('uncaughtException', error => {
    console.log('uncaughtException', error);
});

require('./handlers');
