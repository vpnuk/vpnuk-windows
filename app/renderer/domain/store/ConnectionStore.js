import { makeAutoObservable } from 'mobx';
import { connectionStates } from '@modules/constants.js';

class ConnectionStore {
    current = null;
    state = connectionStates.disconnected;
    gateway = null;
    
    constructor() {
        makeAutoObservable(this);
    }
};

export default ConnectionStore;