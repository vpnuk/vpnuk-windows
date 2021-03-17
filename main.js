const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const url = require('url');
const { runOpenVpn, killWindowsProcess, killWindowsProcessSync } =
    require('./src/utils/openVpn')
const { getLogFileStream } = require('./src/utils/logs');
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

ipcMain.on('connection-start', (event, profile) => {
    isDev && console.log('connection-start event');
    // todo: validate arg (Profile);
    var newConnection;
    try {
        var stream = getLogFileStream(profile.id);
        // onError => exception
        newConnection = runOpenVpn(profile, stream, stream,
            code => {
                stream.end();
                isDev && console.log(`ovpn exited with code ${code}`);
                event.sender.send('connection-stopped', code);
            });
    } catch (error) {
        isDev && console.error(error);
        if (error.message === 'No OpenVPN found') {
            console.log(dialog.showMessageBoxSync({
                type: 'error',
                title: 'Error',
                message: 'OpenVPN is not installed.'
            }));
        }
    }
    isDev && console.log(newConnection.pid, newConnection.exitCode);
    newConnection && event.sender.send('connection-started', newConnection.pid);
    newConnection && (pid = newConnection.pid);
});

ipcMain.on('connection-stop', (event, arg) => {
    isDev && console.log('connection-stop event', arg);
    killWindowsProcess(arg, code => {
        isDev && console.log(`kill process PID=${arg} result=${code}`);
        event.sender.send('connection-stopped', code);
        pid = null;
    });
});

ipcMain.on('is-dev-request', event => {
    event.sender.send('is-dev-response', isDev);
});

ipcMain.on('show-context-menu', (event, args) => {
    const menu = Menu.buildFromTemplate([{
        label: 'Inspect Element',
        click: () => { window.inspectElement(args.x, args.y) }
    }])
    menu.popup(BrowserWindow.fromWebContents(event.sender))
})