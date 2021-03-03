const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');

let window;
var quit = false;

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
        if (!quit) {
            window.webContents.send('connection-kill');
            event.preventDefault();
        }
    });

    window.on('closed', () => {
        window = null;
    })
}

ipcMain.on('app-quit', _ => {
    quit = true;
    window.close();
});

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