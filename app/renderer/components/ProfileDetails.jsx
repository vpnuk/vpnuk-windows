import React, { useEffect, useState } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import '@components/index.css';
import { ServerSelector, ConnectionDetails } from '@components';
import { useStore } from '@domain';

const ProfileDetails = observer(({ profileId }) => {
    const store = useStore().profiles;
    const [showMore, setShowMore] = useState(false);
    const profile = store.getProfile(profileId);

    return (
        <>
            <div className="form-profile-block">
                <div className="form-profile-block-inline">
                    <input
                        type="text"
                        placeholder="name"
                        value={profile.label}
                        onChange={action(e => profile.label = e.target.value)}
                    />
                    <button
                        className="form-button"
                        onClick={action(() => store.deleteProfile(profile.id))}
                    >
                        Delete
                    </button>
                    <div className="form-titles">Credentials</div>
                    <input
                        placeholder="login"
                        value={profile.credentials.login}
                        onChange={action(e => profile.credentials.login = e.target.value)} />
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