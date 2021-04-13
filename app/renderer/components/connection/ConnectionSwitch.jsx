import { ipcRenderer } from 'electron';
import React from 'react';
import { Switch } from 'antd';
import { CSSTransition } from 'react-transition-group';
import { observer } from 'mobx-react-lite';
import { connectionStates } from '@modules/constants.js';
import { Connection } from '@domain';
import '@components/index.css';

const ConnectionSwitch = ({ profile }) =>
    <div className="column-content_block-check">
        <CSSTransition
            classNames="switch"
            in={Connection.state === connectionStates.connected}
            timeout={360}
        >
            <Switch
                className="switch"
                onChange={checked => {
                    if (checked && Connection.state === connectionStates.disconnected) {
                        ipcRenderer.send('connection-start', {
                            profile,
                            gateway: Connection.gateway
                        });
                    }
                    else {
                        ipcRenderer.send('connection-stop');
                    }
                }}
                checked={Connection.state !== connectionStates.disconnected}
            />
        </CSSTransition>
        <p>{Connection.state}</p>
    </div>;

export default observer(ConnectionSwitch);