import { makeAutoObservable } from 'mobx';
import { VpnType } from '@modules/constants.js';

class SettingsStore {
    vpnType = VpnType.OpenVPN.label;
    profileId = '';
    isModalOpen = false;
    update = {
        info: null,
        progress: null
    };
    
    constructor() {
        makeAutoObservable(this);
    }

    toggleModal() {
        this.isModalOpen = !this.isModalOpen;
    }
}

export default SettingsStore;