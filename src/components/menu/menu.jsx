import { ipcRenderer } from 'electron';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select'
import CreatableSelect from "react-select/creatable";
import { Profile } from '../profile/profile';
import { optionsConnectionType } from '../../utils/constants';
import {
    selectConnectionType,
    setConnectionType,
    selectCurrentProfile,
    selectProfilesAvailable,
    setCurrentProfile,
    addProfile
} from '../../reducers/settingsSlice';
import { selectPid } from '../../reducers/connectionSlice';
import { annotateItemLabel, selectOptionColors } from '../../utils/visual';
import './menu.css';
import { isDev } from '../../app';

export const Menu = () => {
    const dispatch = useDispatch();

    const connection = useSelector(selectPid);
    const connectionType = useSelector(selectConnectionType);
    const profiles = useSelector(selectProfilesAvailable);
    const profile = useSelector(selectCurrentProfile);
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
                defaultValue={connectionTypes.find(oct => oct.value === connectionType)}
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
                if (connection) {
                    ipcRenderer.send('connection-stop', connection);
                }
                else {
                    ipcRenderer.send('connection-start',
                        profiles.find(p => p.id === profile.id));
                }
            }}>
                {connection ? 'Disconnect' : 'Connect'}
            </button>
            {isDev && <button className="form-button" onClick={() =>
                console.log(connectionType, profile, connection)}>Print</button>}
        </>
    );
};