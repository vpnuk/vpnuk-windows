import React, { useState, useEffect } from 'react';
import WorldImage from '../../assets/world.png';
import SettingsImage from '../../assets/settings.png';
import { Switch } from 'antd';
import './Content.css';
import { runOpenVpn, OvpnOptions, killWindowsProcess } from '../../helpers/openVpn';
import { initializeSettings } from '../../settings/settings';
const w = window.require('electron').remote.getCurrentWindow();

export const ContentVPN = ({ showDrawer, connection, setConnection }) => {
    //const [connection, setConnection] = useState(false);
    const [connectedText, setConnectedText] = useState('Disconnected');
    const [swithStyle, setSwithStyle] = useState(
        "linear-gradient(to right, #97AAAA, #97AAAA)"
    );

    useEffect(() => {
        initializeSettings()
            .then((options) => {
                w.appOptions = options;
            });
    }, []);

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
            var newConnection;
            try {
                newConnection = runOpenVpn(new OvpnOptions());
            } catch (error) {
                console.error(error);
                if (error.message === 'No OpenVPN found') {
                    const { dialog } = window.require('electron').remote;
                    console.log(dialog.showMessageBoxSync({
                        type: 'error',
                        title: 'Error',
                        message: 'OpenVPN is not installed.'
                    }));
                }
            }
            console.log(newConnection)
            newConnection && setConnection(newConnection);
        } else {
            killWindowsProcess(
                window.require('electron').remote.require('child_process'),
                connection.pid);
            setConnection(null);
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
