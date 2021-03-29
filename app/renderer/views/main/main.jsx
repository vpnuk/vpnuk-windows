import { ipcRenderer } from 'electron';
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Switch } from 'antd';
import WorldImage from '@assets/world.png';
import SettingsImage from '@assets/settings.png';
import './main.css';
import {
    selectLogin,
    selectServerName,
    selectCurrentProfile,
    selectProfilesAvailable,
    setCurrentProfile
} from '@reducers/settingsSlice';
import {
    selectConState,
    selectGateway
} from '@reducers/connectionSlice';
import { selectOptionColors } from '@styles';
import { connectionStates } from '@modules/constants.js';

export const MainPage = ({ showDrawer }) => {
    const dispatch = useDispatch();

    const connectionState = useSelector(selectConState);
    const login = useSelector(selectLogin);
    const serverName = useSelector(selectServerName);
    const profiles = useSelector(selectProfilesAvailable);
    const profile = useSelector(selectCurrentProfile);
    const gateway = useSelector(selectGateway);

    return (
        <>
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
                        <div className="column-content_block-check">
                            <CSSTransition
                                classNames="switch"
                                in={connectionState === connectionStates.connected}
                                timeout={360}
                            >
                                <Switch
                                    className="switch"
                                    onChange={checked => {
                                        console.log('switch', checked, connectionState);
                                        if (checked && connectionState === connectionStates.disconnected) {
                                            ipcRenderer.send('connection-start', { profile, gateway });
                                        }
                                        else {
                                            ipcRenderer.send('connection-stop');
                                        }
                                    }}
                                    checked={connectionState !== connectionStates.disconnected}
                                />
                            </CSSTransition>
                            <p>{connectionState}</p>
                        </div>
                        <Select
                            name="profile-main"
                            className="form-select"
                            styles={selectOptionColors}
                            options={profiles}
                            value={profile}
                            onChange={value => dispatch(setCurrentProfile(value.id))} />
                        <div className="column-content_block-text">
                            <p>{login}</p>
                            <p>{serverName}</p>
                        </div>
                    </div>
                    <div className="column-block"></div>
                </div>
                <div className="column"></div>
            </div>
        </>
    );
};
