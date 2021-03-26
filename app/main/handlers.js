const { BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const {
    runOpenVpn,
    killWindowsProcess,
    getOvpnAdapterNames
} = require('./utils/openVpn');
const { getLogFileStream, openLogFileExternal } = require('./utils/logs');
const {
    getDefaultGateway,
    defaultRoute,
    addRouteSync,
    deleteRouteSync,
    getIPv6Adapters,
    disableIPv6
} = require('./utils/routing');
const { connectionStates } = require('../modules/constants');

const isDev = process.env.ELECTRON_ENV === 'Dev';

let pid = null;
const setPid = value => pid = value;
exports.setPid = setPid;

const showMessageBoxOnError = (error, title = 'Error') => {
    isDev && console.error(error);
    console.log(dialog.showMessageBoxSync({
        type: 'error',
        title: title,
        message: error.message
    }));
}

ipcMain.on('connection-start', (event, args) => {
    isDev && console.log('connection-start event', args);
    const { profile, gateway } = args;
    const { tray } = require('./main');
                
    // todo: validate arg (Profile);

    var newConnection;
    try {
        var stream = getLogFileStream(profile.id);

        // ? onError => exception
        newConnection = runOpenVpn(profile, stream, stream,
            code => { // OnExit
                stream.end();
                pid = null;
                isDev && console.log(`ovpn exited with code ${code}`);
                event.sender.send('connection-changed', connectionStates.disconnected);
                tray.setDisconnectedState('Disconnected');
                if (profile.killSwitchEnabled) {
                    console.log(`addRoute ${defaultRoute} ${gateway}`,
                        addRouteSync(defaultRoute, gateway, defaultRoute).trim());
                }
                console.log(`deleteRoute ${profile.server.host} ${gateway}`,
                    deleteRouteSync(profile.server.host, gateway).trim());
            },
            data => { // On stdout data
                isDev && console.log(`ovpn-out: ${data}`);
                if (data.includes('End ipconfig commands for register-dns')) {
                    if (profile.killSwitchEnabled) {
                        // console.log(`addRoute ${defaultRoute} ${gateway}`,
                        //     addRouteSync(profile.server.host, gateway).trim());
                        console.log(`deleteRoute ${defaultRoute} ${gateway}`,
                            deleteRouteSync(defaultRoute, gateway).trim());
                    }
                    pid = newConnection.pid;
                    event.sender.send('connection-changed', connectionStates.connected); 
                    tray.setConnectedState(`Connected to ${profile.server.label}`);
                }
            });
    } catch (error) {
        showMessageBoxOnError(error, 'Error starting connection');
    }
    isDev && console.log('newConnection', newConnection.pid, newConnection.exitCode);
    event.sender.send('connection-changed', connectionStates.connecting);
    tray.setConnectingState(`Connecting to ${profile.server.label}...`);
});

ipcMain.on('connection-stop', () => {
    isDev && console.log('connection-stop event');
    killWindowsProcess(pid, code => {
        isDev && console.log(`killed process PID=${pid} result=${code}`);
    });
});

ipcMain.on('is-dev-request', event => {
    isDev && console.log('is-dev-request event');
    event.sender.send('is-dev-response', isDev);
});

ipcMain.on('context-menu-show', (event, args) => {
    const { window } = require('./main');
    const menu = Menu.buildFromTemplate([{
        label: 'Inspect Element',
        click: () => { window.inspectElement(args.x, args.y) }
    }])
    menu.popup(BrowserWindow.fromWebContents(event.sender))
});

ipcMain.on('log-open', (_, profileId) => {
    try {
        openLogFileExternal(profileId);
    }
    catch (error) {
        showMessageBoxOnError(error, 'Error opening log file');
    }
});

ipcMain.on('default-gateway-request', async event => {
    isDev && console.log('default-gateway-request event');
    event.sender.send('default-gateway-response',
        await getDefaultGateway());
});

ipcMain.on('ipv6-fix', async () => {
    isDev && console.log('ipv6-fix event');
    try {
        const ovpnAdapters = await getOvpnAdapterNames();
        isDev && console.log('ipv6-fix ovpnAdapters', ovpnAdapters);
        (await getIPv6Adapters()).forEach(async adapter => {
            if (adapter.ipv6Enabled && ovpnAdapters.some(_ => _ === adapter.name)) {
                const code = await disableIPv6(adapter.name);
                isDev && console.log(`IPv6 disabled for ${adapter.name} with code ${code}`);
            }
        });
    }
    catch (error) {
        (error.message !== 'No OpenVPN found.')
            && console.error('ipv6-fix error', error.message);
        showMessageBoxOnError(error, 'IPv6 disable');
    }
});