import React from 'react';
import { observer } from 'mobx-react-lite';
import WorldImage from '@assets/world.png';
import SettingsImage from '@assets/settings.png';
import '@components/index.css';
import { ConnectionSwitch, ValueSelector } from '@components';
import { useStore } from '@domain';
import { action } from 'mobx';

const MainPage = observer(({ showDrawer }) => {
    const store = useStore();
    return <>
        <div className="wrapper-content">
            <div className="column">
                <div className="settings-button" onClick={showDrawer}>
                    <img alt="settings-icon" src={`${SettingsImage}`} />
                    <div>
                        <p>Settings</p>
                    </div>
                </div>
            </div>
            <div className="column">
                <div className="column-block column-image_world">
                    <img alt="world-img" src={`${WorldImage}`} />
                </div>
                <div className="column-block column-content_block">
                    <div className="column-content_block-title">PRIVACY MODE</div>
                    <ConnectionSwitch />
                    <ValueSelector
                        options={store.profiles.getProfiles()}
                        value={store.profiles.currentProfile}
                        onChange={action(value => {
                            store.settings.vpnType = value.vpnType;
                            store.settings.profileId = value.id;
                        })} />
                    <div className="column-content_block-text">
                        <p>{store.profiles.currentProfile.credentials.login}</p>
                        <p>{store.profiles.currentProfile.server.label}</p>
                    </div>
                </div>
                <div className="column-block"></div>
            </div>
            <div className="column"></div>
        </div>
    </>;
});

export default MainPage;