import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import '@components/index.css';
import { Radio } from 'antd';
import { OvpnOptions, useStore } from '@domain';
import { action } from 'mobx';

const OvpnDetails = observer(() => {
    const store = useStore();
    const details = store.profiles.getProfile(store.settings.profileId).details;
    // Radio not supported by mobx natively: https://github.com/foxhound87/mobx-react-form/issues/288
    const [ports, setPorts] = useState(OvpnOptions.getPorts(details.protocol));
    const [currentPort, setPort] = useState(details.port);

    return (
        <div className="connection-details-wrapper">
            <Radio.Group
                defaultValue={details.protocol}
                onChange={action(e => {
                    details.protocol = e.target.value;
                    let newPorts = OvpnOptions.getPorts(e.target.value);
                    setPorts(newPorts);
                    details.port = newPorts[0];
                    setPort(newPorts[0]);
                })}
            >
                {OvpnOptions.protocolNames.map(name =>
                    <Radio.Button key={name} value={name}>
                        {name}
                    </Radio.Button>)}
            </Radio.Group>
            <Radio.Group
                defaultValue={currentPort}
                onChange={action(e => {
                    details.port = e.target.value;
                    setPort(e.target.value);
                })}
            >
                {ports.map(port =>
                    <Radio.Button
                        key={port}
                        value={port}
                        checked={port === currentPort}
                    >
                        {port}
                    </Radio.Button>)}
            </Radio.Group>
        </div>
    );
});

export default OvpnDetails;