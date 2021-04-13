import React, { useEffect, useState } from 'react';
import { Radio } from 'antd';
import '@components/index.css';
import { ValueSelector } from '@components';
import { Servers } from '@domain';
import { observer } from 'mobx-react-lite';

const ServerSelector = ({ profile }) => {
    // note: react-select doesn't work properly with
    // observed properties, but works fine with state hook.
    // Local state changes are thrown to observable state
    // from these hooks.

    const [type, setType] = useState('shared');
    const [catalog, setCatalog] = useState([]);
    const [server, setServer] = useState();

    useEffect(() => { // initialize
        setType(profile.serverType);
        let newcat = selectСatalog(profile.serverType);
        setCatalog(newcat);
        setServer(profile.server.host
            ? profile.server
            : newcat[0]);
    }, []);

    useEffect(() => { // type changed
        profile.serverType = type;
        let newcat = selectСatalog(type);
        setCatalog(newcat);
        setServerFirstIfExists(newcat);
    }, [type]);

    useEffect(() => { // server changed
        profile.server = server;
    }, [server]);

    const selectСatalog = type =>
        type === 'shared'
            ? Servers.shared
            : type === 'dedicated'
                ? Servers.dedicated
                : Servers.dedicated11;

    const setServerFirstIfExists = catalog => {
        catalog.length > 0 && setServer(catalog[0]);
    }

    return <>
        <div className="form-titles">Server</div>
        <div className="form-server-block-radio">
            <Radio.Group
                value={type}
                onChange={e => setType(e.target.value)}>

                <Radio.Button value="shared">SHARED</Radio.Button>
                <Radio.Button value="dedicated">DEDICATED</Radio.Button>
                <Radio.Button value="dedicated11">1:1</Radio.Button>
            </Radio.Group>
        </div>
        <ValueSelector
            options={catalog}
            value={server}
            onChange={value => setServer(value)} />
    </>
}

export default observer(ServerSelector);