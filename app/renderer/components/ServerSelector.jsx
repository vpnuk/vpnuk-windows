import React, { useEffect, useState } from 'react';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Radio } from 'antd';
import '@components/index.css';
import { ValueSelector } from '@components';
import { Servers, useStore } from '@domain';

const ServerSelector = observer(() => {
    const profile = useStore().profiles.currentProfile;
    const [catalog, setCatalog] = useState(Servers.getCatalog(profile.serverType));
    useEffect(() => {
        if (!profile.server.host && catalog.length > 0) {
            runInAction(() => {
                profile.server = catalog[0];
            });
        }
    }, [profile, profile.server, catalog]);

    return <>
        <div className="form-titles">Server</div>
        <div className="form-server-block-radio">
            <Radio.Group
                value={profile.serverType}
                onChange={action(e => {
                    profile.serverType = e.target.value;
                    let cat = Servers.getCatalog(e.target.value);
                    cat.length > 0 && (profile.server = cat[0]);
                    setCatalog(cat);
                })}>

                <Radio.Button value="shared">SHARED</Radio.Button>
                <Radio.Button value="dedicated">DEDICATED</Radio.Button>
                <Radio.Button value="dedicated11">1:1</Radio.Button>
            </Radio.Group>
        </div>
        <ValueSelector
            options={catalog}
            value={profile.server}
            onChange={action(value => profile.server = value)} />
    </>
});

export default ServerSelector;