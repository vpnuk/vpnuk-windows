import { makeAutoObservable } from 'mobx';
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
}

export default RootStore;