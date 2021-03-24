import { ipcRenderer } from 'electron';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Radio } from 'antd';
import { Checkbox } from 'antd';
import './details.css';
import { selectDnsCalalog } from '../../reducers/catalogSlice';
import {
    selectDetails,
    setPort,
    setProtocol,
    setDns,
    setMtu,
    selectCurrentProfile,
    setKillSwitch,
    selectKillSwitch
} from '../../reducers/settingsSlice';
import { optionsMtu, protoAndPorts } from '@modules/constants.js';
import { selectOptionColors } from '../../styles';

export const ConnectionDetails = () => {
    const dispatch = useDispatch();
    const dnsCatalog = useSelector(selectDnsCalalog);
    const details = useSelector(selectDetails);
    const profileId = useSelector(selectCurrentProfile).id;
    const killSwitchEnabled = useSelector(selectKillSwitch);

    return (
        <>
            <Checkbox
                checked={killSwitchEnabled}
                onChange={e => dispatch(setKillSwitch(e.target.checked))}
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
            <Select
                name="dns"
                className="form-select"
                styles={selectOptionColors}
                options={dnsCatalog}
                defaultValue={dnsCatalog.find(v => v.label === details.dns.label)}
                onChange={value => dispatch(setDns(value))} />
            <Select
                name="mtu"
                className="form-select"
                styles={selectOptionColors}
                options={optionsMtu}
                defaultValue={optionsMtu.find(v => v.value === details.mtu.value)}
                onChange={value => dispatch(setMtu(value))} />
            <div className="connection-details-wrapper">
                <Radio.Group
                    defaultValue={details.protocol}
                    onChange={e => {
                        dispatch(setProtocol(e.target.value));
                        dispatch(setPort(protoAndPorts.find(pp =>
                            pp.label === e.target.value).ports[0]));
                    }}
                >
                    {protoAndPorts.map(pp =>
                        <Radio.Button key={pp.label} value={pp.label}>
                            {pp.label}
                        </Radio.Button>)}
                </Radio.Group>
                <Radio.Group
                    onChange={e => dispatch(setPort(e.target.value))}
                    defaultValue={details.port}
                >
                    {protoAndPorts.find(pp => pp.label === details.protocol).ports.map(port =>
                        <Radio.Button key={port} value={port} checked={port === details.port}>
                            {port}
                        </Radio.Button>)}
                </Radio.Group>
            </div>
        </>
    );
};