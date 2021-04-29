import React, { useEffect, useState } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Layout } from 'antd';
import './app.css';
import { Sidebar, MainPage } from '@components';
import { initializeCatalogs } from '@modules/catalogs.js';
import { Dns, Servers, OvpnOptions, ConnectionStore, useStore } from '@domain';
const { ipcRenderer } = require('electron');

let isDev, store;

initializeCatalogs().then(catalog => {
    runInAction(() => {
        Dns.values = catalog.dns;
        Servers.values = catalog.servers;
        OvpnOptions.isObfuscateAvailable = catalog.isObfuscateAvailable;
    });
    if (catalog.ovpnUpdateAvailable) {
        ipcRenderer.send('ovpn-update-request', catalog.ovpnUpdateAvailable);
    }
});

const App = observer(() => {
    const [visible, setVisible] = useState(false);
    const innerStore = useStore();
    store = innerStore;

    useEffect(() => {    
        ipcRenderer.send('is-dev-request');
        ipcRenderer.send('default-gateway-request');
        ipcRenderer.send('ipv6-fix');
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

ipcRenderer.on('ovpn-update-response', () => {
    isDev && console.log('ovpn-update-response event', arg);
    // todo: 
    //   - [active connection?] disconnect
    //   - download ovpn
    //   - install ovpn
    //   - remove patch bin // disable obfuscation
    //   - download ovpn patch // enable obfuscation
    //   - [active connection?] offer to reconnect
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
