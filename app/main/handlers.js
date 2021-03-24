const { BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const {
    runOpenVpn,
    killWindowsProcess,
    getOvpnAdapterNamesSync
} = require('./utils/openVpn');
const { getLogFileStream, openLogFileExternal } = require('./utils/logs');
const {
    getDefaultGatewaySync,
    defaultRoute,
    addRouteSync,
    deleteRouteSync,
    getIPv6AdaptersSync,
    disableIPv6Sync
} = require('./utils/routing');
const { isDev, setPid } = require('./main');

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
    // todo: validate arg (Profile);

    var newConnection;
    try {
        var stream = getLogFileStream(profile.id);

        if (profile.killSwitchEnabled && !isDev) {
            deleteRouteSync(gateway, defaultRoute);
            addRouteSync(profile.server.host, gateway);
            isDev && console.log('kill switch UP');
        }

        // ? onError => exception
        newConnection = runOpenVpn(profile, stream, stream,
            code => {
                stream.end();
                isDev && console.log(`ovpn exited with code ${code}`);
                connectionStopped(code, event.sender,
                    profile.killSwitchEnabled && !isDev && {
                        host: profile.server.host,
                        gateway
                    });
            });
    } catch (error) {
        showMessageBoxOnError(error, 'Error starting connection');
    }
    isDev && console.log(newConnection.pid, newConnection.exitCode);
    // todo: never null, have to handle "immediatly stopped" case
    if (newConnection) {
        const { tray } = require('./main');
        event.sender.send('connection-started', newConnection.pid);
        setPid(newConnection.pid);
        tray.setEnabledState(`Connected to ${profile.server.label}`);
    }
});

ipcMain.on('connection-stop', (event, args) => {
    isDev && console.log('connection-stop event', args);
    const { pid, profile, gateway } = args;
    killWindowsProcess(pid, code => {
        isDev && console.log(`kill process PID=${pid} result=${code}`);
        connectionStopped(code, event.sender,
            profile.killSwitchEnabled && !isDev && {
                host: profile.server.host,
                gateway
            });
    });
});


const connectionStopped = (code, sender, killSwitchEnabled = null) => {
    const { tray } = require('./main');
    sender.send('connection-stopped', code);
    tray.setDisabledState('Disconnected');
    setPid(null);
    if (killSwitchEnabled) {
        const { host, gateway } = killSwitchEnabled;
        deleteRouteSync(host);
        addRouteSync(defaultRoute, gateway);
        isDev && console.log('kill switch DOWN');
    }
}

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

ipcMain.on('default-gateway-request', event => {
    isDev && console.log('default-gateway-request event');
    event.sender.send('default-gateway-response',
        getDefaultGatewaySync());
});

ipcMain.on('ipv6-fix', () => {
    isDev && console.log('ipv6-fix event');
    try {
        const ovpnAdapters = getOvpnAdapterNamesSync();
        getIPv6AdaptersSync().forEach(adapter => {
            if (adapter.ipv6Enabled && ovpnAdapters.some(_ => _ === adapter.name)) {
                const code = disableIPv6Sync(adapter.name);
                isDev && console.log(`IPv6 disabled for ${adapter.name} with code ${code}`);
            }
        });
    }
    catch (error) {
        (error.message !== 'No OpenVPN found.')
            && console.error('ipv6-fix error', error.message);
    }
});