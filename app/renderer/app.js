import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Layout } from 'antd';
import './app.css';
import { Sidebar } from './views/sidebar/sidebar';
import { MainPage } from './views/main/main';
import { setDns, setServers } from './reducers/catalogSlice';
import { setPid, setGateway as setGatewayInner } from './reducers/connectionSlice';
import { initializeCatalogs } from '@modules/catalogs.js';
const { ipcRenderer } = require('electron');

let isDev, setConnection, setGateway;

function App() {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        ipcRenderer.send('is-dev-request');
        setGateway = gw => dispatch(setGatewayInner(gw));
        ipcRenderer.send('default-gateway-request');
        ipcRenderer.send('ipv6-fix');

        initializeCatalogs()
            .then(catalog => {
                dispatch(setDns(catalog.dns));
                dispatch(setServers(catalog.servers));
            });

        setConnection = pid => dispatch(setPid(pid));
        return () => {
            setConnection = null;
            setGateway = null;
        }
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
}

ipcRenderer.on('is-dev-response', (_, arg) => {
    isDev = arg;
    exports.isDev = isDev;
});

ipcRenderer.on('default-gateway-response', (_, arg) => {
    isDev && console.log('default-gateway-response event', arg);
    setGateway(arg);
});

ipcRenderer.on('connection-started', (_, pid) => {
    isDev && console.log('connection-started event', pid);
    setConnection(pid);
});

ipcRenderer.on('connection-stopped', (_, arg) => {
    isDev && console.log('connection-stopped event', arg);
    setConnection(null);
});

window.addEventListener('contextmenu', event => {
    if (isDev) {
        event.preventDefault();
        ipcRenderer.send('context-menu-show', { x: event.x, y: event.y });
    }
});

export default App;
