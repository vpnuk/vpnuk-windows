import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RHFInput } from 'react-hook-form-input';
import Select from 'react-select';
import { Checkbox } from 'antd';
import './index.css';
import { Server } from './server/index';
import { Profile } from './profile/index';
import {
    handlerServerTypesStructure,
    handlerServerDnsStructure,
} from '../../../../helpers/serverData';
import {
    optionsConnectionType,
    optionsMtu
} from '../../../../settings/constants';
import { ConnectionDetails } from './connectionDetails/index';

const fs = require('fs');
const w = window.require('electron').remote.getCurrentWindow();

export const DrawerContent = () => {
    const { handleSubmit, register, setValue, reset } = useForm(); // default values?
    // TODO: load from file and set here
    const [optionsConnectionTypeData, setOptionsConnectionTypeData] = useState(
        optionsConnectionType[0]
    );
    const [optionsMtuData, setOptionsMtuData] = useState(optionsMtu[0]);
    const [showMore, setShowMore] = useState(false);
    const [showMoreText, setShowMoreText] = useState('Show more');
    const [radioValue, setRadioValue] = useState('SHARED');
    const [checkboxValue, setCheckboxValue] = useState('SHARED');
    const [shared, setShared] = useState([]);
    const [dedicated, setDedicated] = useState([]);
    const [dedicated11, setDedicated11] = useState([]);
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

    const handleRemoveClick = (index) => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };

    const handleAddClick = () => {
        setInputList([...inputList, { firstName: '', lastName: '' }]);
    };

    function onChangeCheckbox(e) {
        setCheckboxValue(e.target.checked);
    }

    useEffect(() => {
        setShared(handlerServerTypesStructure(w.appOptions.servers, 'shared'));
        setDedicated(handlerServerTypesStructure(w.appOptions.servers, 'dedicated'));
        setDedicated11(handlerServerTypesStructure(w.appOptions.servers, 'dedicated11'));
        setDnsData(handlerServerDnsStructure(w.appOptions.dns));
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

    function onChangeRadio(e) {
        setRadioValue(e.target.value);
    }
    function onChangeRadioConnection(e) {
        setRadioValueConnection(e.target.value);
    }
    function onChangeRadioConnectionValue(e) {
        setRadioValueConnectionValue(e.target.value);
    }

    return (
        <div className="settings-forms-wrapper">
            <form
                onSubmit={handleSubmit((data) => {
                    console.log('data', data); // connection type, dns, mtu
                    console.log('checkboxValue', checkboxValue);
                    console.log('dnsData', dnsData);
                    console.log('radioValueConnection', radioValueConnection);
                    console.log('radioValueConnectionValue', radioValueConnectionValue);
                    console.log('inputList', inputList);

                    fs.writeFileSync('profile.txt', `${inputList[0].firstName}\n${inputList[0].lastName}`);

                })}
            >
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

                <button className="form-button">Save</button>
            </form>
            <Server
                onChangeRadio={onChangeRadio}
                radioValue={radioValue}
                setRadioValue={setRadioValue}
                shared={shared}
                dedicated={dedicated}
                dedicated11={dedicated11}
            />
        </div>
    );
};
