import React, { useEffect, useState } from 'react';
import { action, isObservable, isObservableProp } from 'mobx';
import { observer } from 'mobx-react-lite';
import '@components/index.css';
import { ServerSelector, ConnectionDetails } from '@components';
import { useStore } from '@domain';

const ProfileDetails = observer(() => {
    const store = useStore();
    const [showMore, setShowMore] = useState(false);
    const [profile, setProfile] = useState(
        store.profiles.getProfile(store.settings.profileId));
    console.log('is obs',
        isObservable(store.settings), isObservableProp(store.settings, 'profileId')
    );
    useEffect(() => {
        console.log('profileId changed')
        setProfile(store.profiles.getProfile(store.settings.profileId));
    }, [store.settings.profileId]);

    return (
        <>
            <div className="form-profile-block">
                <div className="form-profile-block-inline">
                    <input
                        placeholder="name"
                        defaultValue={profile.label}
                        onChange={action(e => profile.label = e.target.value)}
                    />
                    <button
                        className="form-button"
                        onClick={action(() => store.profiles.deleteProfile(profile.id))}
                    >
                        Delete
                    </button>
                    <div className="form-titles">Credentials</div>
                    <input
                        placeholder="login"
                        defaultValue={profile.credentials.login}
                        onChange={e => profile.credentials.login = e.target.value} />
                    <input
                        placeholder="password"
                        defaultValue={profile.credentials.password}
                        onChange={e => profile.credentials.password = e.target.value}
                    />
                </div>
            </div>
            <ServerSelector profile={profile} />
            <div type="more" className="form-show-more" onClick={() => setShowMore(!showMore)}>
                {showMore ? 'Hide' : 'Show more'}
            </div>
            <div className={(showMore ? '' : 'hidden') + ' show-more-wrapper'}>
                <ConnectionDetails
                    details={profile.details}
                    profileId={profile.id} />
            </div>
        </>
    );
});

export default ProfileDetails;