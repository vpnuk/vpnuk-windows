import { ipcRenderer } from 'electron';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { connectionStates } from '@modules/constants.js';
import { useStore } from '@domain';

const ConnectionButton = observer(() => {
    const store = useStore();

    return (
        <button
            className="form-button"
            onClick={() => {
                if (store.connection.state !== connectionStates.disconnected) {
                    ipcRenderer.send('connection-stop');
                }
                else if (store.connection.state === connectionStates.disconnected) {
                    ipcRenderer.send('connection-start', {
                        profile: store.profiles.getProfile(store.settings.profileId),
                        gateway: store.connection.gateway
                    });
                }
            }}
        >
            {store.connection.state !== connectionStates.disconnected
                ? 'Disconnect'
                : 'Connect'}
        </button>
    );
});

export default ConnectionButton;