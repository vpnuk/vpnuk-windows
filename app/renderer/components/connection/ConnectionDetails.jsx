import { ipcRenderer } from 'electron';
import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Checkbox } from 'antd';
import '@components/index.css';
import { optionsMtu } from '@modules/constants.js';
import { ValueSelector } from '@components';
import { Dns, useStore } from '@domain';

const ConnectionDetails = observer(() => {
    const profile = useStore().profiles.currentProfile;

    return <>
        <Checkbox
            checked={profile.details.killSwitchEnabled}
            onChange={action(e => profile.details.killSwitchEnabled = e.target.checked)}
            style={{ color: "#fff" }}
        >
            Kill Switch
    </Checkbox>
        <div
            className="form-show-more-connection-log"
            onClick={() => ipcRenderer.send('log-open', profile.id)}
        >
            View the connection log
    </div>
        <ValueSelector
            options={Dns.values}
            value={profile.details.dns}
            onChange={action(value => profile.details.dns = value)} />
        <ValueSelector
            options={optionsMtu}
            value={profile.details.mtu}
            onChange={action(value => profile.details.mtu = value)} />
    </>
});

export default ConnectionDetails;
