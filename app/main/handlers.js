const { dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
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
const { connectionStates, settingsPath } = require('../modules/constants');
const { replaceVersionsEntry } = require('./utils/versions');
const {
    checkRootCert,
    removeRootCert,
    importRootCert
} = require('./utils/certs');
const { enableAutoUpdate } = require('./updater');

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

const closeConnection = async (beforeDisconnectCb = () => { }) => {
    let status = await vpnConnection?.getConnectionStatus();
    isDev && console.log(`closeConnection. status=${status}`);
    if (!vpnConnection || status !== connectionStates.connected) {
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
        beforeDisconnectCb();
        await vpnConnection.disconnect();
        return true;
    }
    return false;
};
exports.closeConnection = closeConnection;

ipcMain.on('connection-start', async (event, args) => {
    isDev && console.log('connection-start event', args);
    const { profile, gateway, wVpnOptions } = args; // todo: validate profile
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
    }, wVpnOptions);

    await vpnConnection.connect();
});

ipcMain.on('connection-stop', async () => {
    isDev && console.log('connection-stop event', vpnConnection);
    await vpnConnection?.disconnect();
});

ipcMain.on('is-dev-request', event => {
    isDev && console.log('is-dev-request event');
    event.sender.send('is-dev-response', isDev);
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

ipcMain.on('ovpn-update-request', async (event, arg) => {
    isDev && console.log('ovpn-update-request event');
    if (dialog.showMessageBoxSync({
        type: 'question',
        icon: path.join(__dirname, '../assets/icon.ico'),
        title: 'VPNUK update',
        message: `OpenVPN ${arg.version} update available.\nInstall now?`,
        buttons: ['Yes', 'No'],
        cancelId: 1
    }) !== 1) {
        vpnConnection?.type === 'OpenVPN' && (await vpnConnection?.disconnect());
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

ipcMain.on('auto-update-enable', event => {
    isDev && console.log('auto-update-enable event');
    enableAutoUpdate(event.sender);
});

ipcMain.on('ikev2-cert-install', async (event, arg) => {
    isDev && console.log('ikev2-cert-install event');
    if (arg || !(await checkRootCert())) {
        isDev && console.log('ikev2-cert-install in');
        await removeRootCert();
        try {
            await fs.access(settingsPath.ikev2Cert);
            await importRootCert(settingsPath.ikev2Cert);
        } catch (err) {
            console.log('ikev2-cert-install error', err);
            // todo: messagebox
            event.sender.send('ikev2-cert-installed', false);
            return;
        }
    }
    event.sender.send('ikev2-cert-installed', true);
});
