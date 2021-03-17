const { BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const { runOpenVpn, killWindowsProcess } = require('./src/utils/openVpn');
const { getLogFileStream } = require('./src/utils/logs');

const isDev = process.env.ELECTRON_ENV === 'Dev';

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

ipcMain.on('context-menu-show', (event, args) => {
    const menu = Menu.buildFromTemplate([{
        label: 'Inspect Element',
        click: () => { window.inspectElement(args.x, args.y) }
    }])
    menu.popup(BrowserWindow.fromWebContents(event.sender))
})