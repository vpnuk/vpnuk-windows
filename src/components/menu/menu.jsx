import { ipcRenderer } from 'electron';
import React from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import Select from 'react-select';
import { Profile } from '../profile/profile';
import { optionsConnectionType } from '../../utils/constants';
import {
    selectConnectionType,
    setConnectionType,
    selectCurrentProfile,
    selectProfilesAvailable,
    setCurrentProfile
} from '../../reducers/settingsSlice';
import { selectPid } from '../../reducers/connectionSlice';
import './menu.css';

export const Menu = () => {
    const dispatch = useDispatch();

    const connection = useSelector(selectPid);
    const connectionType = useSelector(selectConnectionType);
    const profiles = useSelector(selectProfilesAvailable);
    const profile = useSelector(selectCurrentProfile);

    const printHandler = () => {
        console.log(connectionType, profile, connection);
    }

    // todo: profile add new option/button
    return (
        <>
            <div className="form-titles">Connection Type</div>
            <Select
                name="connectionType"
                className="form-select"
                options={optionsConnectionType}
                defaultValue={optionsConnectionType.find(oct => oct.value === connectionType.value)}
                onChange={value => dispatch(setConnectionType(value))} />
            <div className="form-titles">Profile</div>
            <Select
                name="profile"
                className="form-select"
                options={profiles}
                value={profile}
                onChange={value => dispatch(setCurrentProfile(value.id))} />
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
            <button className="form-button" onClick={() => printHandler()}>Print</button>
        </>
    );
};