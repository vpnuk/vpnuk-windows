import { makeAutoObservable, toJS } from 'mobx';
import { ProfileStore, SettingsStore } from '@domain';
import persist from './persist';

class RootStore {
    constructor() {
        this.settings = persist(
            new SettingsStore(),
            'settings',
            ['vpnType', 'profileId']);
        this.profiles = persist(
            new ProfileStore(this.settings),
            'profiles',
            ['profiles']);
        makeAutoObservable(this);
    }

    triggerPersist() {
        this.profiles.profiles = toJS(this.profiles.profiles);
    }
}

export default RootStore;