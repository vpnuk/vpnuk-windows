import { makeAutoObservable } from 'mobx';
import { VpnType } from '../catalog/VpnType';

class SettingsStore {
    vpnType = VpnType.OpenVPN.label;
    profileId = '';
    
    constructor() {
        makeAutoObservable(this);
        // todo: restore from file data
    }
}

export default SettingsStore;