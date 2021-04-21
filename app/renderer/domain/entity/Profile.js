import { makeAutoObservable, observable, runInAction } from 'mobx';
import { v4 as uuid } from 'uuid';
import { optionsMtu } from '@modules/constants.js';
import { VpnProvider } from '../catalog/VpnProvider';

class Profile {
    id = uuid();
    label = 'Label';
    provider = 'Provider';
    credentials = {
        login: '',
        password: ''
    };
    serverType = 'shared';
    server = {
        host: '',
        label: ''
    };
    details = {
        port: '1194',
        protocol: 'UDP',
        dns: { label: 'DNS: Default' },
        mtu: optionsMtu.find(o => o.value === ''),
        killSwitchEnabled: false
    };

    constructor(label = 'New profile', provider = VpnProvider.OpenVPN.label) {
        makeAutoObservable(this);
        runInAction(() => {
            this.label = label;
            this.provider = provider;
        });
    }
};

export default Profile;