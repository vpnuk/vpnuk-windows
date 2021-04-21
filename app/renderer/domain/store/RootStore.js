import { ProfileStore, SettingsStore } from '@domain';

// todo: persist profiles and settings (async hook)

class RootStore {
    constructor() {
        this.settings = new SettingsStore();
        this.profiles = new ProfileStore(this.settings);
    }
}

export default RootStore;