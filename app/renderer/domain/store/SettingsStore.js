import { makeAutoObservable } from 'mobx';
import { VpnProvider } from '../catalog/VpnProvider';

class SettingsStore {
    provider = VpnProvider.OpenVPN.label;
    profileId = '';
    
    constructor() {
        makeAutoObservable(this);
    }
}

export default SettingsStore;