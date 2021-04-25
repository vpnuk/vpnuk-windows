import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuid } from 'uuid';
import { optionsMtu } from '@modules/constants.js';
import { VpnType } from '../catalog/VpnType';

class Profile {
    id = uuid();
    label = 'Label';
    vpnType = 'Type';
    credentials = {
        login: '',
        password: ''
    };
    serverType = 'shared';
    server = {
        host: '',
        label: 'Select server...'
    };
    details = {
        port: '1194',
        protocol: 'UDP',
        dns: { label: 'DNS: Default' },
        mtu: optionsMtu.find(o => o.value === ''),
        killSwitchEnabled: false
    };

    constructor(label = 'New profile', vpnType = VpnType.OpenVPN.label) {
        makeAutoObservable(this);
        runInAction(() => {
            this.label = label;
            this.vpnType = vpnType;
        });
    }
};

export default Profile;