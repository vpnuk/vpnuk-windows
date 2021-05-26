import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Layout } from 'antd';
import './app.css';
import { modalStyle } from '@styles';
import { Sidebar, MainPage, UpdateInfo } from '@components';
import {
    checkOvpnUpdates,
    downloadOvpnUpdate,
    downloadPatchedOvpnExe,
    initializeCatalogs,
    isObfuscateAvailable
} from '@modules/catalogs.js';
import {
    Dns,
    Servers,
    OvpnOptions,
    ConnectionStore,
    useStore,
    WvpnOptions
} from '@domain';
import scheduler, { HOUR_MS } from '@modules/scheduler.js';
const { ipcRenderer } = require('electron');

let isDev, store;

initializeCatalogs().then(catalog => {
    isDev && console.log('initializeCatalogs', catalog);
    runInAction(() => {
        Dns.values = catalog.dns;
        Servers.values = catalog.servers;
        OvpnOptions.isObfuscateAvailable = catalog.isObfuscateAvailable;
        WvpnOptions.ipseckey = catalog.ipseckey;
    });
});

function ovpnCheckUpdate() {
    checkOvpnUpdates().then(info => {
        info && ipcRenderer.send('ovpn-update-request', info);
    });
}

Modal.setAppElement('#root');

const App = observer(() => {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const innerStore = useStore();
    store = innerStore;

    useEffect(() => {
        ipcRenderer.send('is-dev-request');
        ipcRenderer.send('default-gateway-request');
        ipcRenderer.send('ipv6-fix');
        ipcRenderer.send('auto-update-enable');
        ovpnCheckUpdate(); // check on start and every 3 days then
        scheduler.schedule('ovpn-check-update', ovpnCheckUpdate, 72 * HOUR_MS);
    }, []);

    const showDrawer = () => {
        setSidebarVisible(true);
    };

    return (
        <div className="App" id="app">
            <Layout style={{ height: "100%" }}>
                <Sidebar
                    visible={isSidebarVisible}
                    setVisible={setSidebarVisible} />
                <Layout>
                    <MainPage
                        showDrawer={showDrawer} />
                </Layout>
            </Layout>
            <Modal
                isOpen={innerStore.settings.isModalOpen}
                closeTimeoutMS={200}
                style={modalStyle}
            >
                <UpdateInfo />
            </Modal>
        </div>
    );
});

// todo: move to handlers.js

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

ipcRenderer.on('auto-update-info', (_, arg) => {
    isDev && console.log('auto-update-info event', arg);
    store.settings.update.info = arg;
    store.settings.toggleModal();
});

ipcRenderer.on('auto-update-progress', (_, arg) => {
    isDev && console.log('auto-update-progress event', arg);
    runInAction(() => {
        store.settings.update.progress = arg;
    });
});

window.addEventListener('beforeunload', _ => {
    isDev && console.log('window beforeunload event');
    runInAction(() => {
        store.triggerPersist();
    });
});

export default App;
