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
import { settingsPath } from '../../../../settings/settings';
import { ConnectionDetails } from './connectionDetails/index';

const fs = require('fs');
const { ipcRenderer } = require('electron');
const w = window.require('electron').remote.getCurrentWindow();

export const DrawerContent = ({ connection }) => {
    const { handleSubmit, register, setValue } = useForm();
    // TODO: load from file and set here
    const [optionsConnectionTypeData, setOptionsConnectionTypeData] = useState(
        optionsConnectionType[0]
    );
    const [optionsMtuData, setOptionsMtuData] = useState(optionsMtu[0]);
    const [showMore, setShowMore] = useState(false);
    const [showMoreText, setShowMoreText] = useState('Show more');
    const [radioValue, setRadioValue] = useState('SHARED');
    const [checkboxValue, setCheckboxValue] = useState('SHARED');
    const [shared, setShared] = useState(w.appOptions.servers.shared[0]);
    const [dedicated, setDedicated] = useState(w.appOptions.servers.dedicated[0]);
    const [dedicated11, setDedicated11] = useState(w.appOptions.servers.dedicated11[0]);
    const [dnsData, setDnsData] = useState([]);
    const [inputList, setInputList] = useState([{ firstName: '', lastName: '' }]);
    const [radioValueConnection, setRadioValueConnection] = useState('TCP');
    const [radioValueConnectionValue, setRadioValueConnectionValue] = useState('443');

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...inputList];
        list[index][name] = value;
        setInputList(list);
    };

    const handleRemoveClick = index => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };

    const handleAddClick = () => {
        setInputList([...inputList, { firstName: '', lastName: '' }]);
    };

    const onChangeCheckbox = e => {
        setCheckboxValue(e.target.checked);
    }

    useEffect(() => {
        setShared(w.appOptions.servers.shared);;
        setDedicated(w.appOptions.servers.dedicated);
        setDedicated11(w.appOptions.servers.dedicated11);
        setDnsData(w.appOptions.dns);
        setOptionsConnectionTypeData(optionsConnectionType);
        setOptionsMtuData(optionsMtu);
    }, []);

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
        fs.writeFileSync(
            settingsPath.profile,
            `${inputList[0].firstName}\n${inputList[0].lastName}`);
    }

    const onChangeRadio = e => {
        setRadioValue(e.target.value);
    }
    const onChangeRadioConnection = e => {
        setRadioValueConnection(e.target.value);
    }
    const onChangeRadioConnectionValue = e => {
        setRadioValueConnectionValue(e.target.value);
    }

    const handleConnect = data => {
        ipcRenderer.send('connection-start', {
            proto: radioValueConnection.toLowerCase(),
            port: radioValueConnectionValue,
            host: data.server?.value.address,
            dnsAddresses: data.dns && [data.dns.value.primary, data.dns.value.secondary],
            mtu: data.mtu.value
        });
    }

    return (
        <div className="settings-forms-wrapper">
            <form onSubmit={handleSubmit(handleConnect)}>
                <div className="form-titles">Connection Type</div>
                <RHFInput
                    as={<Select options={optionsConnectionTypeData} />}
                    //rules={{ required: true }}
                    name="connectionType"
                    register={register}
                    setValue={setValue}
                    className="form-select"
                    defaultValue={optionsConnectionTypeData}
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
                    />
                    <RHFInput
                        as={<Select options={optionsMtuData} />}
                        //rules={{ required: true }}
                        name="mtu"
                        register={register}
                        setValue={setValue}
                        className="form-select"
                        defaultValue={optionsMtuData}
                    />
                    <ConnectionDetails
                        radioValueConnection={radioValueConnection}
                        onChangeRadioConnection={onChangeRadioConnection}
                        radioValueConnectionValue={radioValueConnectionValue}
                        onChangeRadioConnectionValue={onChangeRadioConnectionValue}
                    />
                </div>
                <Profile
                    register={register}
                    setValue={setValue}
                    handleInputChange={handleInputChange}
                    handleRemoveClick={handleRemoveClick}
                    handleAddClick={handleAddClick}
                    inputList={inputList}
                    setInputList={setInputList}
                />
                <button
                    type="button"
                    className="form-button"
                    onClick={saveButtonHandler}>Save</button>
                <div className="form-titles">Server</div>
                <div className="form-server-block">
                    <div className="form-server-block-radio">
                        <Radio.Group onChange={onChangeRadio} defaultValue={radioValue}>
                            <Radio.Button value="SHARED">SHARED</Radio.Button>
                            <Radio.Button value="DEDICATED">DEDICATED</Radio.Button>
                            <Radio.Button value="1:1">1:1</Radio.Button>
                        </Radio.Group>
                    </div>
                    <RHFInput
                        as={
                            <Select
                                options={
                                    radioValue === "SHARED"
                                        ? shared
                                        : radioValue === "DEDICATED"
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
                            radioValue === "SHARED"
                                ? shared
                                : radioValue === "DEDICATED"
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
