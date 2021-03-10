import React from 'react';
import './profile.css';
import { Server } from '../connection/server';
import { copyObject } from '../../helpers/utils';

export const Profile = ({ profile, setProfile, commonSettings }) => {
    const handleChange = e => {
        const { name, value } = e.target;
        switch (name) {
            case 'label':
                profile.label = value;
                break;
            case 'login':
                profile.config.credentials.login = value;
                break;
            case 'password':
                profile.config.credentials.password = value;
                break;
            default:
                console.log('switch error');
        }
        setProfile(copyObject(profile));
    }

    return (
        <>
            <div className="form-profile-block">
                <div className="form-profile-block-inline">
                    <input
                        name="label"
                        placeholder="name"
                        value={profile.label}
                        onChange={handleChange}
                    />
                    <input
                        name="login"
                        placeholder="login"
                        value={profile.config.credentials.login}
                        onChange={handleChange}
                    />
                    <input
                        name="password"
                        placeholder="password"
                        value={profile.config.credentials.password}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <Server
                profile={profile}
                setProfile={setProfile}
                commonSettings={commonSettings} />
        </>
    );
};