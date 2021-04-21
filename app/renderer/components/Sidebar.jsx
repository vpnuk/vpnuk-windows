import React from 'react';
import { observer } from 'mobx-react-lite';
import { Drawer } from 'antd';
import '@components/index.css';
import SettingsImage from '@assets/settings.png';
import { Menu } from '@components';

const Sidebar = observer(({ visible, setVisible }) =>
    <Drawer
        title={<SettingsTitle />}
        placement="left"
        onClose={() => setVisible(false)}
        visible={visible}
        width={522}
        closable
        headerStyle={{ background: "#000000" }}
        drawerStyle={{ background: "#000000" }}>

        <Menu />
    </Drawer>
);

const SettingsTitle = () => {
    return (
        <div className="settings-button-modal">
            <img alt="settings-icon" src={`${SettingsImage}`} />
            <div>
                <p>Settings</p>
            </div>
        </div>
    );
};

export default Sidebar;