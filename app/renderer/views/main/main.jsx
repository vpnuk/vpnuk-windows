import { ipcRenderer } from 'electron';
import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useSelector } from 'react-redux';
import { Switch } from 'antd';
import WorldImage from '@assets/world.png';
import SettingsImage from '@assets/settings.png';
import './main.css';
import {
    selectLogin,
    selectServerName,
    selectCurrentProfile
} from '../../reducers/settingsSlice';
import {
    selectPid,
    selectGateway
} from '../../reducers/connectionSlice';

export const MainPage = ({ showDrawer }) => {
    const pid = useSelector(selectPid);
    const login = useSelector(selectLogin);
    const serverName = useSelector(selectServerName);
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
                            <CSSTransition in={pid && true} timeout={360} classNames="switch">
                                <Switch
                                    onChange={checked => {
                                        if (checked) {
                                            ipcRenderer.send('connection-start', { profile, gateway });
                                        } else {
                                            ipcRenderer.send('connection-stop', pid);
                                        }
                                    }}
                                    checked={pid && true}
                                    className="switch"
                                />
                            </CSSTransition>
                            <p>{pid ? 'Connected' : 'Disconnected'}</p>
                        </div>
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
