import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Layout } from 'antd';
import './app.css';
import { Sidebar } from './components/sidebar/sidebar';
import { MainPage } from './components/main/main';
import { setDns, setServers } from './reducers/catalogSlice';
import { setPid } from './reducers/connectionSlice';
import { initializeCatalogs } from './utils/catalogs';
const { ipcRenderer } = require('electron');
let isDev, setConnection;

function App() {
    ipcRenderer.send('is-dev-request');

    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        initializeCatalogs()
            .then(catalog => {
                dispatch(setDns(catalog.dns));
                dispatch(setServers(catalog.servers));
            });
        
        setConnection = pid => dispatch(setPid(pid));
        return () => setConnection = null;
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
