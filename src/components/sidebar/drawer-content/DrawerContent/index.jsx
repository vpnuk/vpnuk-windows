import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RHFInput } from 'react-hook-form-input';
import Select from 'react-select';
import { Checkbox, Radio } from 'antd';
import './index.css';
import { Profile } from './profile/index';
import {
    optionsConnectionType,
    optionsMtu
} from '../../../../settings/constants';
//import { settingsPath } from '../../../../settings/settings';
import { ConnectionDetails } from './connectionDetails/index';
const { settingsPath } = require('../../../../settings/settings');
const fs = require('fs');
const { ipcRenderer } = require('electron');

// TODO: get from main process
const isDev = true;

const findByLabelOrFirst = (arr, label) =>
    arr.find(el => el.label === label) || arr[0];

export const DrawerContent = ({ connection, commonSettings, settings, setSettings }) => {
    const { handleSubmit, register, setValue } = useForm();
    const [connectionType, setConnectionType] = useState(
        findByLabelOrFirst(optionsConnectionType, settings.connectionType));
    const [showMore, setShowMore] = useState(false);
    const [showMoreText, setShowMoreText] = useState('Show more');
    const [killSwitchEnabled, setkillSwitchEnabled] = useState(false);
    const [dnsData, setDnsData] = useState(
        findByLabelOrFirst(commonSettings.dns, settings.dns.name));
    const [mtu, setMtu] = useState(
        optionsMtu.find(o => o.value === settings.mtu) || optionsMtu[0]);
    const [protocol, setProtocol] = useState(settings.protocol || 'UDP');
    const [port, setPort] = useState(settings.port || '1194');
    const [profileList, setProfileList] = useState([settings.profile]);
    const [serverType, setServerType] = useState(settings.server.type || 'SHARED');
    const [shared, setShared] = useState(
        findByLabelOrFirst(commonSettings.servers.shared, settings.server.name));
    const [dedicated, setDedicated] = useState(
        findByLabelOrFirst(commonSettings.servers.dedicated, settings.server.name));
    const [dedicated11, setDedicated11] = useState(
        findByLabelOrFirst(commonSettings.servers.dedicated11, settings.server.name));
    
    const handleProfileListChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...profileList];
        list[index][name] = value;
        setProfileList(list);
    };

    const handleRemoveProfile = index => {
        const list = [...profileList];
        list.splice(index, 1);
        setProfileList(list);
    };

    const handleAddProfile = () => {
        setProfileList([...profileList, { login: '', password: '' }]);
    };

    const onChangeCheckbox = e => {
        setkillSwitchEnabled(e.target.checked);
    };

    useEffect(() => {
        setShared(commonSettings.servers.shared);;
        setDedicated(commonSettings.servers.dedicated);
        setDedicated11(commonSettings.servers.dedicated11);
        setDnsData(commonSettings.dns);
        setConnectionType(optionsConnectionType);
        setMtu(optionsMtu);
    }, [
        commonSettings.dns,
        commonSettings.servers.shared,
        commonSettings.servers.dedicated,
        commonSettings.servers.dedicated11
    ]);

    const handleShowMore = () => {
        if (!showMore) {
            setShowMore(true);
            setShowMoreText('Hide');
        } else {
            setShowMore(false);
            setShowMoreText('Show more');
        }
    };

    const saveButtonHandler = () => {
        settings.profile = profileList[0];
        // JS clone object be like
        setSettings(JSON.parse(JSON.stringify(settings, undefined, 2)));
        saveProfile(profileList[0]);
    }

    const onChangeRadio = e => {
        setServerType(e.target.value);
    }
    const onChangeRadioConnection = e => {
        setProtocol(e.target.value);
    }
    const onChangeRadioConnectionValue = e => {
        setPort(e.target.value);
    }

    const handleConnect = data => {
        isDev && console.log('handleConnect', data);
        var newSettings = {
            connectionType: data.connectionType.value,
            protocol: protocol,
            port: port,
            server: {
                name: data.server?.label,
                type: serverType,
                host: data.server?.value,
            },
            dns: data.dns && {
                name: data.dns.label,
                addresses: data.dns.value
            },
            mtu: data.mtu.value,
            profile: profileList[0]
        };
        isDev && console.log('handleConnect', newSettings);
        setSettings(newSettings);
        
        saveProfile(newSettings.profile);
        ipcRenderer.send('connection-start', newSettings);
        
        fs.writeFile(
            settingsPath.settings,
            JSON.stringify(newSettings, undefined, 2),
            'utf8', _ => {}
        );
    }

    return (
        <div className="settings-forms-wrapper">
            <form onSubmit={handleSubmit(handleConnect)}>
                <div className="form-titles">Connection Type</div>
                <RHFInput
                    as={<Select options={connectionType} />}
                    //rules={{ required: true }}
                    name="connectionType"
                    register={register}
                    setValue={setValue}
                    className="form-select"
                    defaultValue={connectionType}
                />
                <div type="more" onClick={handleShowMore} className="form-show-more">
                    {showMoreText}
                </div>
                <div className={(showMore ? '' : 'hidden') + ' show-more-wrapper'}>
                    <Checkbox onChange={onChangeCheckbox} style={{ color: "#fff" }}>
                        Kill Switch
                    </Checkbox>
                    <div className="form-show-more-connection-log">
                        View the connection log
                    </div>
                    <RHFInput
                        as={<Select options={dnsData} placeholder="DNS: Default" />}
                        //rules={{ required: true }}
                        name="dns"
                        register={register}
                        setValue={setValue}
                        className="form-select"
                        defaultValue={dnsData}
                    />
                    <RHFInput
                        as={<Select options={mtu} />}
                        //rules={{ required: true }}
                        name="mtu"
                        register={register}
                        setValue={setValue}
                        className="form-select"
                        defaultValue={mtu}
                    />
                    <ConnectionDetails
                        radioValueConnection={protocol}
                        onChangeRadioConnection={onChangeRadioConnection}
                        radioValueConnectionValue={port}
                        onChangeRadioConnectionValue={onChangeRadioConnectionValue}
                    />
                </div>
                <Profile
                    register={register}
                    setValue={setValue}
                    handleInputChange={handleProfileListChange}
                    handleRemoveClick={handleRemoveProfile}
                    handleAddClick={handleAddProfile}
                    inputList={profileList}
                    setInputList={setProfileList}
                />
                <button
                    type="button"
                    className="form-button"
                    onClick={saveButtonHandler}>Save</button>
                <div className="form-titles">Server</div>
                <div className="form-server-block">
                    <div className="form-server-block-radio">
                        <Radio.Group onChange={onChangeRadio} defaultValue={serverType}>
                            <Radio.Button value="SHARED">SHARED</Radio.Button>
                            <Radio.Button value="DEDICATED">DEDICATED</Radio.Button>
                            <Radio.Button value="1:1">1:1</Radio.Button>
                        </Radio.Group>
                    </div>
                    <RHFInput
                        as={
                            <Select
                                options={
                                    serverType === "SHARED"
                                        ? shared
                                        : serverType === "DEDICATED"
                                            ? dedicated
                                            : dedicated11
                                }
                            />
                        }
                        //rules={{ required: true }}
                        name="server"
                        register={register}
                        setValue={setValue}
                        className="form-select"
                        defaultValue={
                            serverType === "SHARED"
                                ? shared
                                : serverType === "DEDICATED"
                                    ? dedicated
                                    : dedicated11
                        }
                    />
                </div>
                <button
                    className="form-button"
                    disabled={connection && true}
                >Connect</button>
            </form>
        </div>
    );
};

const saveProfile = profile => {
    fs.writeFileSync(
        settingsPath.profile,
        `${profile.login}\n${profile.password}`);
}

