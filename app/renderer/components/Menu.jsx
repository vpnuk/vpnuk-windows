import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import CreatableSelect from "react-select/creatable";
import { useStore, VpnProvider } from '@domain';
import { ProfileDetails, ConnectionButton, ValueSelector } from '@components';
import { selectOptionColors } from '@styles';
import '@components/index.css';

const Menu = observer(() => {
    const rootStore = useStore();
    const store = useStore().profiles;
    const vpnProviders = annotateProviderLabels(VpnProvider, '(Coming soon)');
    const [profile, setProfile] = useState(store.getProfile());

    return (
        <>
            <div className="form-titles">Connection Type</div>
            <ValueSelector
                options={vpnProviders}
                value={vpnProviders.find(avp => avp.value === VpnProvider.OpenVPN.label)}
                onChange={option => console.log(option.label)} />
            <div className="form-titles">Profile</div>
            <CreatableSelect
                className="form-select"
                styles={selectOptionColors}
                options={store.getProfiles(VpnProvider.OpenVPN.label)}
                getOptionLabel={option => option.label}
                getOptionValue={option => option.id}
                value={profile}
                onChange={id => setProfile(store.getProfile(id))}
                onCreateOption={label => {
                    let p = store.createProfile(label);
                    setProfile(p);
                }} />
            <ProfileDetails profileId={profile.id} />
            <ConnectionButton profile={profile} />
            {/* todo: remove this after debug */}
            <button
                className="form-button"
                onClick={() => {
                    console.log('print', rootStore);
                }}
            >
                PRINT
            </button>
        </>
    );
});

const annotateProviderLabels = (providers, annotation) => Object.entries(providers).map(entry => {
    let provider = entry[1];
    return {
        value: provider.label,
        label: (<>
            <span style={{ color: provider.isDisabled && 'gray' }}>{provider.label}</span>
            {provider.isDisabled && (
                <span style={{ float: 'right', fontSize: 'smaller' }}>{annotation}</span>
            )}
        </>),
        isDisabled: provider.isDisabled
    };
});

export default Menu;