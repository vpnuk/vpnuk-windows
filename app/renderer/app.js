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

window.addEventListener('contextmenu', event => {
    isDev && console.log('window contextmenu event');
    if (isDev) {
        event.preventDefault();
        ipcRenderer.send('context-menu-show', { x: event.x, y: event.y });
    }
});

window.addEventListener('beforeunload', _ => {
    isDev && console.log('window beforeunload event');
    store.triggerPersist();
});

export default App;
