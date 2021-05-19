import { makeAutoObservable } from 'mobx';
import { VpnType } from '@modules/constants.js';

class SettingsStore {
    vpnType = VpnType.OpenVPN.label;
    profileId = '';
    
    constructor() {
        makeAutoObservable(this);
    }
}

export default SettingsStore;