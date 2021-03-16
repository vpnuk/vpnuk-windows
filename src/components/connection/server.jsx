import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Radio } from 'antd';
import './server.css';
import {
    selectServer,
    setServer
} from '../../reducers/settingsSlice';
import { selectServerCatalog } from '../../reducers/catalogSlice';
import { selectOptionColors } from '../../utils/visual';

export const Server = () => {
    const dispatch = useDispatch();
    const servers = useSelector(selectServerCatalog);
    const server = useSelector(selectServer);

    const [serverCatalog, setServerCatalog] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);
    
    useEffect(() => {
        setSelectedServer(selectСatalog(server.type)
            .find(s => s.label === server.label))
    }, []);

    useEffect(() => {
        setServerCatalog(selectСatalog(server.type.toLowerCase()));
    }, [selectedServer]);

    const selectСatalog = type =>
        type === "shared"
            ? servers.shared
            : type === "dedicated"
                ? servers.dedicated
                : servers.dedicated11;

    return (
        <>
            <div className="form-titles">Server</div>
            <div className="form-server-block-radio">
                <Radio.Group
                    defaultValue={server.type.toUpperCase()}
                    onChange={e => {
                        dispatch(setServer({
                            host: '',
                            label: '',
                            type: e.target.value.toLowerCase()
                        }));
                        setServerCatalog(selectСatalog(e.target.value.toLowerCase()));
                        setSelectedServer(null);
                    }}>

                    <Radio.Button value="SHARED">SHARED</Radio.Button>
                    <Radio.Button value="DEDICATED">DEDICATED</Radio.Button>
                    <Radio.Button value="1:1">1:1</Radio.Button>
                </Radio.Group>
            </div>
            <Select
                name="server"
                className="form-select"
                styles={selectOptionColors}
                options={serverCatalog}
                value={selectedServer}
                getOptionValue={option => option.label}
                onChange={value => {
                    setSelectedServer(value);
                    dispatch(setServer(value));
                }} />
        </>
    );
};