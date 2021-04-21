import { makeAutoObservable, runInAction } from 'mobx';
import { Profile } from '@domain';
import { VpnType } from '../catalog/VpnType';

const defaultProfileName = 'Default';

class ProfileStore {
    profiles = [];

    constructor(settings) {
        this.settings = settings;
        makeAutoObservable(this, { settings: false });
        runInAction(() => {
            // todo: restore from file
            let defp = new Profile(defaultProfileName);
            this.profiles = [defp];
        });
    }

    getProfiles(vpnType = VpnType.OpenVPN.label) {
        return this.profiles.filter(p => p.vpnType === vpnType);
    }

    getProfile(id) {
        return this.profiles.find(p => p.id === id) || this.profiles[0];
    }

    createProfile(name, provider) {
        let newProfile = new Profile(name, provider);
        this.profiles.push(newProfile);
        this.settings.profileId = newProfile.id;
    }

    deleteProfile(id) {
        let index = this.profiles.findIndex(p => p.id === id);
        this.profiles.splice(index, 1);
        this.profiles = this.profiles.length
            ? this.profiles
            : [new Profile(defaultProfileName, this.settings.vpnType)];
        index = index - 1 < 0 ? 0 : index - 1; 
        this.settings.profileId = this.profiles[index];
    }

    get currentProfile() {
        return this.getProfile(this.settings.profileId);
    }
};

export default ProfileStore;