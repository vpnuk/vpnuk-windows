import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Radio } from 'antd';
import './server.css';
import {
    selectServer,
    setServer,
    selectServerType,
    setServerType
} from '@reducers/settingsSlice';
import { selectServerCatalog } from '@reducers/catalogSlice';
import { selectOptionColors } from '@styles';

export const Server = () => {
    const dispatch = useDispatch();
    const servers = useSelector(selectServerCatalog);
    const server = useSelector(selectServer);
    const serverType = useSelector(selectServerType);

    const [serverCatalog, setServerCatalog] = useState([]);

    useEffect(() => {
        const catalog = selectСatalog(serverType);
        setServerCatalog(catalog);
        setServerFirstIfExists(catalog);
    }, [serverType]);

    useEffect(() => {
        !server.host && setServerFirstIfExists(selectСatalog(serverType));
    }, [server]);

    const selectСatalog = type =>
        type === "shared"
            ? servers.shared
            : type === "dedicated"
                ? servers.dedicated
                : servers.dedicated11;

    const setServerFirstIfExists = catalog => {
        catalog.length > 0 && dispatch(setServer(catalog[0]));
    }

    return (
        <>
            <div className="form-titles">Server</div>
            <div className="form-server-block-radio">
                <Radio.Group
                    value={serverType}
                    onChange={e => dispatch(setServerType(e.target.value))}>

                    <Radio.Button value="shared">SHARED</Radio.Button>
                    <Radio.Button value="dedicated">DEDICATED</Radio.Button>
                    <Radio.Button value="dedicated11">1:1</Radio.Button>
                </Radio.Group>
            </div>
            <Select
                name="server"
                className="form-select"
                styles={selectOptionColors}
                options={serverCatalog}
                value={server}
                getOptionValue={option => option.label}
                onChange={value => dispatch(setServer(value))} />
        </>
    );
};