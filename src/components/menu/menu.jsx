import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RHFInput } from 'react-hook-form-input';
import Select from 'react-select';
import { Profile } from '../profile/profile';
import { findByLabelOrFirst } from '../../helpers/utils';
import { optionsConnectionType } from '../../settings/constants';

import { _emptySettings as settings } from '../../settings/settings';

//{connection, commonSettings, settings, setSettings}
export const Menu = ({ commonSettings }) => {
    const { handleSubmit, register, setValue } = useForm();
    const [connectionType, setConnectionType] = useState(
        findByLabelOrFirst(optionsConnectionType, settings.currentType));
    // todo: 0 -> currentProfile or empty one
    const [profile, setProfile] = useState(settings.profiles[settings.currentType][0]);

    var currentProfile = settings.profiles[settings.currentType][0];

    useEffect(() => {
        setConnectionType(optionsConnectionType);
        setProfile(settings.profiles['OpenVpn']);
    }, []);

    // todo: make changes on select value change
    const printHandler = data => {
        console.log(data);
    }

    // todo: profile add new option/button
    return (
        <form onSubmit={handleSubmit(printHandler)}>
            <div className="form-titles">Connection Type</div>
            <RHFInput
                as={<Select options={connectionType} />}
                name="connectionType"
                register={register}
                setValue={setValue}
                className="form-select"
                defaultValue={connectionType}
            />
            <div className="form-titles">Profile</div>
            <RHFInput
                as={<Select options={profile} />}
                name="profile"
                register={register}
                setValue={setValue}
                className="form-select"
                defaultValue={profile}
            />
            <Profile
                profile={currentProfile}
                setProfile={setProfile}
                commonSettings={commonSettings} />
            <button
                className="form-button"
            >Print</button>
        </form>
    );
};