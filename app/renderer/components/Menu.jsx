import React, { useState } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import CreatableSelect from 'react-select/creatable';
import { selectOptionColors } from '@styles';
import {
    ProfileDetails,
    ConnectionButton,
    ValueSelector,
    ServerSelector,
    ConnectionDetails,
    OvpnDetails
} from '@components';
import '@components/index.css';
import { useStore, VpnType } from '@domain';
import { isDev } from '@app';

const Menu = observer(() => {
    const store = useStore();
    const vpnTypes = annotateProviderLabels(VpnType, '(Coming soon)');
    const [showMore, setShowMore] = useState(false);

    return <>
        <div className="form-titles">Connection Type</div>
        <ValueSelector
            options={vpnTypes}
            value={vpnTypes.find(type => type.value === store.settings.vpnType)}
            onChange={action(option => store.settings.vpnType = option.value)} />
        <div className="form-titles">Profile</div>
        <CreatableSelect
            className="form-select"
            styles={selectOptionColors}
            options={store.profiles.getProfiles(store.settings.vpnType)}
            getOptionLabel={option => option.label}
            value={store.profiles.currentProfile}
            onChange={action(value => store.settings.profileId = value.id)}
            onCreateOption={action(label => store.profiles.createProfile(label))} />
        <ProfileDetails />
        <ServerSelector />
        <div type="more" className="form-show-more" onClick={() => setShowMore(!showMore)}>
            {showMore ? 'Hide' : 'Show more'}
        </div>
        <div className={(showMore ? '' : 'hidden') + ' show-more-wrapper'}>
            <ConnectionDetails />
            <div className={(store.settings.vpnType === VpnType.OpenVPN.label ? '' : 'hidden')}>
                <OvpnDetails />
            </div>
        </div>
        <ConnectionButton />
        <button className={(isDev ? '' : 'hidden') + ' form-button'}
            onClick={() => {
                console.log('PRINT', store);
            }}>
            PRINT
        </button>
    </>;
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