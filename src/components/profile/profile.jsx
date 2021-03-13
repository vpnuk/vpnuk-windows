import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './profile.css';
import { Server } from '../connection/server';
import { ConnectionDetails } from '../connection/details';
import {
    selectCurrentProfile,
    setProfileName,
    setLogin,
    setPassword
} from '../../reducers/settingsSlice';

export const Profile = () => {
    const dispatch = useDispatch();
    const profile = useSelector(selectCurrentProfile);
    
    const [showMore, setShowMore] = useState(false);
    
    return (
        <>
            <div className="form-profile-block">
                <div className="form-profile-block-inline">
                    <input
                        name="label"
                        placeholder="name"
                        value={profile.label}
                        onChange={e => dispatch(setProfileName(e.target.value))}
                    />
                    <div className="form-titles">Credentials</div>
                    <input
                        name="login"
                        placeholder="login"
                        value={profile.credentials.login}
                        onChange={e => dispatch(setLogin(e.target.value))}
                    />
                    <input
                        name="password"
                        placeholder="password"
                        value={profile.credentials.password}
                        onChange={e => dispatch(setPassword(e.target.value))}
                    />
                </div>
            </div>
            <Server />
            <div type="more" className="form-show-more" onClick={() => setShowMore(!showMore)}>
                {showMore ? 'Hide' : 'Show more'}
            </div>
            <div className={(showMore ? '' : 'hidden') + ' show-more-wrapper'}>
                <ConnectionDetails />
            </div>
        </>
    );
};