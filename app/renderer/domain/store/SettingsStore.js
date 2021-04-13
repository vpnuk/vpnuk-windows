import { makeAutoObservable, runInAction } from 'mobx';
import { VpnProvider } from '../catalog/VpnProvider';

class SettingsStore {
    provider;
    profileId;
    
    constructor() {
        makeAutoObservable(this);
        runInAction(() => {
            // todo: restore state
            this.provider = VpnProvider.OpenVPN.label;
            this.profileId = null;
        });
    }
}

export default SettingsStore;