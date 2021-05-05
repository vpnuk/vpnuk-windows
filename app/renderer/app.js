import React, { useEffect, useState } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Layout } from 'antd';
import './app.css';
import { Sidebar, MainPage } from '@components';
import {
    checkOvpnUpdates,
    downloadOvpnUpdate,
    downloadPatchedOvpnExe,
    initializeCatalogs,
    isObfuscateAvailable
} from '@modules/catalogs.js';
import { Dns, Servers, OvpnOptions, ConnectionStore, useStore } from '@domain';
import scheduler, { HOUR_MS } from '@modules/scheduler.js';
const { ipcRenderer } = require('electron');

let isDev, store;

initializeCatalogs().then(catalog => {
    runInAction(() => {
        Dns.values = catalog.dns;
        Servers.values = catalog.servers;
        OvpnOptions.isObfuscateAvailable = catalog.isObfuscateAvailable;
    });
});

function ovpnCheckUpdate() {
    checkOvpnUpdates().then(info => {
        info && ipcRenderer.send('ovpn-update-request', info);
    });
}

const App = observer(() => {
    const [visible, setVisible] = useState(false);
    const innerStore = useStore();
    store = innerStore;

    useEffect(() => {
        ipcRenderer.send('is-dev-request');
        ipcRenderer.send('default-gateway-request');
        ipcRenderer.send('ipv6-fix');
        ovpnCheckUpdate(); // check on start and every 3 days then
        scheduler.schedule('ovpn-check-update', ovpnCheckUpdate, 72 * HOUR_MS);
    }, []);

    const showDrawer = () => {
        setVisible(true);
    };

    return (
        <div className="App">
            <Layout style={{ height: "100%" }}>
                <Sidebar
                    visible={visible}
                    setVisible={setVisible} />
                <Layout>
                    <MainPage
                        showDrawer={showDrawer} />
                </Layout>
            </Layout>
        </div>
    );
});

ipcRenderer.on('is-dev-response', (_, arg) => {
    isDev = arg;
    exports.isDev = isDev;
});

ipcRenderer.on('default-gateway-response', (_, arg) => {
    isDev && console.log('default-gateway-response event', arg);
    runInAction(() => {
        ConnectionStore.gateway = arg;
    });

});

ipcRenderer.on('connection-changed', (_, arg) => {
    isDev && console.log('connection-changed event', arg);
    runInAction(() => {
        ConnectionStore.state = arg;
    });
});

ipcRenderer.on('ovpn-update-response', async (event, arg) => {
    isDev && console.log('ovpn-update-response event', arg);
    runInAction(() => {
        OvpnOptions.isObfuscateAvailable = false;
    });

    Promise.all([
        downloadOvpnUpdate(arg.original),
        downloadPatchedOvpnExe(arg.patch)
    ]).then(result => event.sender.send('ovpn-update-install',
        {
            info: arg,
            file: result[0]
        })
    );
});

ipcRenderer.on('ovpn-update-installed', (_, arg) => {
    isDev && console.log('ovpn-update-installed event', arg);
    runInAction(() => {
        OvpnOptions.isObfuscateAvailable = isObfuscateAvailable();
    });
});

window.addEventListener('contextmenu', event => {
    if (isDev) {
        console.log('window contextmenu event');
        event.preventDefault();
        ipcRenderer.send('context-menu-show', { x: event.x, y: event.y });
    }
});

window.addEventListener('beforeunload', _ => {
    isDev && console.log('window beforeunload event');
    store.triggerPersist();
});

export default App;
