import { makeAutoObservable, runInAction } from 'mobx';
import { Profile } from '@domain';
import { VpnProvider } from '../catalog/VpnProvider';

const defaultProfileName = 'Default';

class ProfileStore {
    profiles = [];
    
    constructor() {
        makeAutoObservable(this);
        runInAction(() => {
            // todo: restore from file
            let defp = new Profile(defaultProfileName);
            this.profiles = [defp];
        });
    }

    getProfiles(provider = VpnProvider.OpenVPN.label) {
        return this.profiles.filter(p => p.provider === provider);
    }

    getProfile(id) {
        return this.profiles.find(p => p.id === id) || this.profiles[0];
    }

    createProfile(name, provider) {
        let newProfile = new Profile(name, provider);
        this.profiles.push(newProfile);
        return newProfile;
    }

    deleteProfile(id) {
        let newProfiles = this.profiles.filter(p => p.id !== id);
        this.profiles = newProfiles.length
            ? newProfiles
            : [new Profile(defaultProfileName, this.connectionType)];
    }
};

export default ProfileStore;