import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RHFInput } from 'react-hook-form-input';
import Select from 'react-select';
import { Radio } from 'antd';
import './server.css';
import { copyObject, findByLabelOrFirst } from '../../helpers/utils';

export const Server = ({ profile, setProfile, commonSettings }) => {
    const { register, setValue } = useForm();
    const [serverType, setServerType] = useState(profile.config.server.type || 'SHARED');
    const [currentServer, setCurrentServer] = useState(
        findByLabelOrFirst(
            serverType === "SHARED"
                ? commonSettings.servers.shared
                : serverType === "DEDICATED"
                    ? commonSettings.servers.dedicated
                    : commonSettings.servers.dedicated11,
            profile.config.server.label)
    );

    useEffect(() => {

    }, [profile.config.server]);

    const onChangeRadio = e => {
        setServerType(e.target.value);
        profile.config.server = {
            host: '',
            name: '',
            type: e.target.value
        };
        setProfile(copyObject(profile));
    };

    const onChangeServer = value => {
        profile.config.server.host = value.value;
        profile.config.server.name = value.label;
        setProfile(copyObject(profile));
    };

    return (
        <>
            <div className="form-server-block-radio">
                <Radio.Group onChange={onChangeRadio} defaultValue={serverType}>
                    <Radio.Button value="SHARED">SHARED</Radio.Button>
                    <Radio.Button value="DEDICATED">DEDICATED</Radio.Button>
                    <Radio.Button value="1:1">1:1</Radio.Button>
                </Radio.Group>
            </div>
            <RHFInput
                as={<Select options={
                    serverType === "SHARED"
                        ? commonSettings.servers.shared
                        : serverType === "DEDICATED"
                            ? commonSettings.servers.dedicated
                            : commonSettings.servers.dedicated11} />}
                name="server"
                register={register}
                setValue={setValue}
                className="form-select"
                //value={currentServer}
                onChange={onChangeServer}
            />
        </>
    );
};