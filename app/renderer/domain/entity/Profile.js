import { makeAutoObservable, observable, runInAction } from 'mobx';
import { v4 as uuid } from 'uuid';
import { optionsMtu } from '@modules/constants.js';
import { VpnProvider } from '../catalog/VpnProvider';

class Profile {
    id;
    label;
    type;
    credentials;
    serverType;
    server;
    details;
    killSwitchEnabled;

    constructor(label = 'New profile', provider = VpnProvider.OpenVPN.label) {
        makeAutoObservable(this, { label: observable });
        runInAction(() => {
            this.id = uuid();
            this.label = label;
            this.provider = provider;
            this.credentials = {
                login: '',
                password: ''
            };
            this.serverType = 'shared';
            this.server = {
                host: '',
                label: ''
            };
            this.details = {
                port: '1194',
                protocol: 'UDP',
                dns: { label: 'DNS: Default' },
                mtu: optionsMtu.find(o => o.value === ''),
                killSwitchEnabled: false
            };
        });
    }
};

export default Profile;