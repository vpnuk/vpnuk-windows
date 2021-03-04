import React from "react";
import { Drawer } from "antd";
import { HeaderContent } from "./drawer-content/DrawerContent/Header/index";
import { DrawerContent } from "./drawer-content/DrawerContent/index";
import "./SideBar.css";

export const SideBar = ({ visible, setVisible, connection, commonSettings, settings, setSettings }) => {
    const onClose = () => {
        setVisible(false);
    };

    return (
        <>
            <Drawer
                title={<HeaderContent />}
                placement="left"
                onClose={onClose}
                visible={visible}
                width={522}
                closable
                headerStyle={{ background: "#000000" }}
                drawerStyle={{ background: "#000000" }}>
                <DrawerContent
                    connection={connection}
                    commonSettings={commonSettings}
                    settings={settings}
                    setSettings={setSettings} />
            </Drawer>
        </>
    );
};
