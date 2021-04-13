import { ipcRenderer } from 'electron';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox } from 'antd';
import '@components/index.css';
import { optionsMtu } from '@modules/constants.js';
import { ValueSelector, OvpnDetails } from '@components';
import { Dns } from '@domain';

const ConnectionDetails = ({ details, profileId }) => <>
    <Checkbox
        defaultChecked={details.killSwitchEnabled}
        onChange={e => details.killSwitchEnabled = e.target.checked}
        style={{ color: "#fff" }}
    >
        Kill Switch
    </Checkbox>
    <div
        className="form-show-more-connection-log"
        onClick={() => ipcRenderer.send('log-open', profileId)}
    >
        View the connection log
    </div>
    <ValueSelector
        options={Dns.values}
        defaultValue={details.dns}
        onChange={value => details.dns = value} />
    <ValueSelector
        options={optionsMtu}
        defaultValue={details.mtu}
        onChange={value => details.mtu = value} />
    <OvpnDetails />
</>;

export default observer(ConnectionDetails);
