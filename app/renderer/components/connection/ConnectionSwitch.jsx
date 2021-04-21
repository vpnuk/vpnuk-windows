import { ipcRenderer } from 'electron';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Switch } from 'antd';
import { CSSTransition } from 'react-transition-group';
import '@components/index.css';
import { connectionStates } from '@modules/constants.js';
import { ConnectionStore, useStore } from '@domain';

const ConnectionSwitch = observer(() => {
    const profile = useStore().profiles.currentProfile;

    return <>
        <div className="column-content_block-check">
            <CSSTransition
                classNames="switch"
                in={ConnectionStore.state === connectionStates.connected}
                timeout={360}
            >
                <Switch
                    className="switch"
                    onChange={checked => {
                        if (checked && ConnectionStore.state === connectionStates.disconnected) {
                            ipcRenderer.send('connection-start', {
                                profile,
                                gateway: ConnectionStore.gateway
                            });
                        }
                        else {
                            ipcRenderer.send('connection-stop');
                        }
                    }}
                    checked={ConnectionStore.state !== connectionStates.disconnected}
                />
            </CSSTransition>
            <p>{ConnectionStore.state}</p>
        </div>
    </>;
});

export default ConnectionSwitch;