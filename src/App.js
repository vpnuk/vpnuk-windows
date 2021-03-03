import React, { useState } from "react";
import "./App.css";
import { Layout } from "antd";
import { SideBar } from "./components/sidebar/SideBar";
import { ContentVPN } from "./components/content/Content";

const { Content } = Layout;
const { ipcRenderer } = require('electron')

function App() {
    const [visible, setVisible] = useState(false);
    const [connection, setConnection] = useState(null);

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
                    connection={connection}
                    setConnection={setConnection} />
                <Content>
                    <ContentVPN
                        showDrawer={showDrawer}
                        connection={connection}
                        setConnection={setConnection} />
                </Content>
            </Layout>
        </div>
    );
}

ipcRenderer.on('connection-kill', event => {
    console.log('kill event')
    // todo: kill connection process via message to main process (send pid)
    
    event.sender.send('app-quit')
})

export default App;
