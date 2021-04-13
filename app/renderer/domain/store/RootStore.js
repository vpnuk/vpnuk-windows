import { ConnectionStore, ProfileStore, SettingsStore } from '@domain';

// todo: persist profiles and settings (async hook)

class RootStore {
    constructor() {
        this.connection = new ConnectionStore(); // (this);
        this.profiles = new ProfileStore(); // (this);
        this.settings = new SettingsStore(); // (this);
    }
}

export default RootStore;