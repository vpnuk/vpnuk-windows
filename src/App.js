import React, { useEffect, useState } from "react";
import "./App.css";
import { Layout } from "antd";
import { SideBar } from "./components/sidebar/SideBar";
import { ContentVPN } from "./components/content/Content";

const { Content } = Layout;
const isDev = require('electron-is-dev');
const { ipcRenderer } = require('electron');
let setConnection;

function App() {
    const [visible, setVisible] = useState(false);
    const [connection, setConnectionInner] = useState(null);

    useEffect(() => {
        setConnection = setConnectionInner;
        return () => setConnection = null
    });

    const showDrawer = () => {
        setVisible(true);
    };

    return (
        <div className="App">
            <Layout style={{ height: "100%" }}>
                <SideBar
                    showDrawer={showDrawer}
                    visible={visible}
                    setVisible={setVisible}
                    connection={connection} />
                <Content>
                    <ContentVPN
                        showDrawer={showDrawer}
                        connection={connection} />
                </Content>
            </Layout>
        </div>
    );
}

ipcRenderer.on('connection-started', (_, arg) => {
    isDev && console.log('connection-started event', arg);
    setConnection(arg);
});

ipcRenderer.on('connection-stopped', (_, arg) => {
    isDev && console.log('connection-stopped event', arg);
    setConnection(null);
});

export default App;
