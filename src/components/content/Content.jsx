import React, { useState, useEffect } from 'react';
import WorldImage from '../../assets/world.png';
import SettingsImage from '../../assets/settings.png';
import { Switch } from 'antd';
import './Content.css';
const { ipcRenderer } = require('electron');

export const ContentVPN = ({ showDrawer, connection, settings }) => {
    const [connectedText, setConnectedText] = useState('Disconnected');
    const [swithStyle, setSwithStyle] = useState(
        "linear-gradient(to right, #97AAAA, #97AAAA)"
    );

    useEffect(() => {
        if (connection) {
            setConnectedText('Connected');
            setSwithStyle("linear-gradient(to right, #1ACEB8, #0BBFBA)");
        } else {
            setConnectedText('Disconnected');
            setSwithStyle("linear-gradient(to right, #97AAAA, #5B6A6A)");
        }
    }, [connection]);

    function onChange(checked) {
        if (checked) {
            ipcRenderer.send('connection-start', {
                prot: 'udp',
                host: '84.19.112.105',
                port: '1194',
                dnsAddresses: ['8.8.8.8', '8.8.4.4'],
                mtu: '1500'
            });
        } else {
            ipcRenderer.send('connection-stop', connection);
        }
    }

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
                            <Switch
                                onChange={onChange}
                                checked={connection && true}
                                className="switch"
                                style={{
                                    background: swithStyle,
                                }}
                            />
                            <p>{connectedText}</p>
                        </div>
                        <div className="column-content_block-text">
                            <p>Account username</p>
                            <p>Server name</p>
                        </div>
                    </div>
                    <div className="column-block"></div>
                </div>
                <div className="column"></div>
            </div>
        </>
    );
};
