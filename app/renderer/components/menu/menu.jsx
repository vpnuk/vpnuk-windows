import { ipcRenderer } from 'electron';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select'
import CreatableSelect from "react-select/creatable";
import { Profile } from '../profile/profile';
import { optionsConnectionType } from '@modules/constants.js';
import {
    selectConnectionType,
    setConnectionType,
    selectCurrentProfile,
    selectProfilesAvailable,
    setCurrentProfile,
    addProfile
} from '../../reducers/settingsSlice';
import {
    selectPid,
    selectGateway
} from '../../reducers/connectionSlice';
import { annotateItemLabel, selectOptionColors } from '../../styles';
import './menu.css';
import { isDev } from '../../app';

export const Menu = () => {
    const dispatch = useDispatch();

    const pid = useSelector(selectPid);
    const connectionType = useSelector(selectConnectionType);
    const profiles = useSelector(selectProfilesAvailable);
    const profile = useSelector(selectCurrentProfile);
    const gateway = useSelector(selectGateway);
    const [connectionTypes, setConnectionTypes] = useState([]);

    useEffect(() => {
        setConnectionTypes(annotateItemLabel(optionsConnectionType, '(Coming soon)'));
    }, []);

    return (
        <>
            <div className="form-titles">Connection Type</div>
            <Select
                name="connectionType"
                className="form-select"
                styles={selectOptionColors}
                options={connectionTypes}
                value={connectionTypes.find(oct => oct.value === connectionType)}
                onChange={option => dispatch(setConnectionType(option.value))} />
            <div className="form-titles">Profile</div>
            <CreatableSelect
                name="profile"
                className="form-select"
                styles={selectOptionColors}
                options={profiles}
                getOptionValue={option => option.label}
                value={profile}
                onChange={value => dispatch(setCurrentProfile(value.id))}
                onCreateOption={label => dispatch(addProfile(label))} />
            <Profile />
            <button className="form-button" onClick={() => {
                if (pid) {
                    ipcRenderer.send('connection-stop',  { pid, profile, gateway });
                }
                else {
                    ipcRenderer.send('connection-start',
                        {
                            profile: profiles.find(p => p.id === profile.id),
                            gateway
                        }
                    );
                }
            }}>
                {pid ? 'Disconnect' : 'Connect'}
            </button>
            {isDev && <button className="form-button" onClick={() =>
                console.log(connectionType, profile, pid)}>Print</button>}
        </>
    );
};