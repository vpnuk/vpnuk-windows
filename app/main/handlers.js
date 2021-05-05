const { BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const publicIp = require('public-ip');
const {
    createVpn,
    getOvpnAdapterNames,
    installOvpnUpdate,
} = require('./vpn');
const { openLogFileExternal } = require('./utils/logs');
const {
    getDefaultGateway,
    defaultRoute,
    addRouteSync,
    deleteRouteSync,
    getIPv6Adapters,
    disableIPv6
} = require('./utils/routing');
const { connectionStates } = require('../modules/constants');
const { replaceVersionsEntry } = require('./utils/versions');

const isDev = process.env.ELECTRON_ENV === 'Dev';

let vpnConnection = null;

const showMessageBoxOnError = (error, title = 'Error') => {
    isDev && console.error(error);
    console.log(dialog.showMessageBoxSync({
        type: 'error',
        title: title,
        message: error.message
    }));
};

const closeConnectionSync = () => {
    isDev && console.log(`closeConnectionSync. status=${vpnConnection?.getConnectionStatus()}`);
    if (!vpnConnection || vpnConnection.getConnectionStatus()
            === connectionStates.disconnected) {
        return true;
    }
    if (dialog.showMessageBoxSync({
        type: 'warning',
        icon: path.join(__dirname, '../assets/icon.ico'),
        title: 'VPNUK Warning',
        message: 'Connection is active right now',
        buttons: ['Disconnect and exit', 'Cancel'],
        cancelId: 1
    }) !== 1) {
        vpnConnection.disconnect();
        return true;
    }
    return false;
};
exports.closeConnectionSync = closeConnectionSync;

ipcMain.on('connection-start', (event, args) => {
    isDev && console.log('connection-start event', args);
    const { profile, gateway } = args; // todo: validate profile
    isDev && console.log('connection-start details', profile.details);
    const { tray } = require('./main');

    vpnConnection = createVpn(profile, {
        connectedHook: async () => {
            if (profile.killSwitchEnabled) {
                console.log(`deleteRoute ${defaultRoute} ${gateway}`,
                    deleteRouteSync(defaultRoute, gateway).trim());
            }
            const ip = await publicIp.v4();
            event.sender.send('connection-changed', connectionStates.connected);
            tray.setConnectedState(`Connected to ${profile.server.label}\nYour IP: ${ip}`);
        },
        disconnectedHook: () => {
            try {
                event.sender.send('connection-changed', connectionStates.disconnected);
            }
            catch (error) { // sender (window) may be destroyed if app is closing
                if (error.message !== 'Object has been destroyed') {
                    throw error;
                }
            }
            tray.setDisconnectedState('Disconnected');
            if (profile.killSwitchEnabled) {
                console.log(`addRoute ${defaultRoute} ${gateway}`,
                    addRouteSync(defaultRoute, gateway, defaultRoute).trim());
            }
            console.log(`deleteRoute ${profile.server.host} ${gateway}`,
                deleteRouteSync(profile.server.host, gateway).trim());
        },
        connectingHook: () => {
            event.sender.send('connection-changed', connectionStates.connecting);
            tray.setConnectingState(`Connecting to ${profile.server.label}...`);
        },
        errorHook: error => {
            showMessageBoxOnError(error, 'Error starting connection');
        }
    });

    vpnConnection.connect();
});

ipcMain.on('connection-stop', () => {
    isDev && console.log('connection-stop event', vpnConnection);
    vpnConnection?.disconnect();
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

ipcMain.on('ovpn-update-request', (event, arg) => {
    isDev && console.log('ovpn-update-request event');
    if (dialog.showMessageBoxSync({
        type: 'question',
        icon: path.join(__dirname, '../assets/icon.ico'),
        title: 'VPNUK update',
        message: `OpenVPN ${arg.version} update available.\nInstall now?`,
        buttons: ['Yes', 'No'],
        cancelId: 1
    }) !== 1) {
        vpnConnection?.type === 'OpenVPN' && vpnConnection?.disconnect();
        event.sender.send('ovpn-update-response', arg);
    }
});

ipcMain.on('ovpn-update-install', (event, arg) => {
    isDev && console.log('ovpn-update-install event', arg);
    if (installOvpnUpdate(arg.file) === 0) {
        isDev && console.log('ovpn-update-install success');
        dialog.showMessageBoxSync({
            type: 'info',
            icon: path.join(__dirname, '../assets/icon.ico'),
            title: 'VPNUK update',
            message: 'OpenVPN is updated successfully!',
            buttons: ['Ok']
        });
        replaceVersionsEntry('openvpn', arg.info);
        event.sender.send('ovpn-update-installed', true);
    }
    else {
        isDev && console.log('ovpn-update-install fail');
        if (dialog.showMessageBoxSync({
            type: 'error',
            title: 'VPNUK update',
            message: 'OpenVPN update failed.\nTry again?',
            buttons: ['Yes', 'No'],
            cancelId: 1
        }) !== 1) {
            event.sender.send('ovpn-update-response', arg.info);
        }
    }
});