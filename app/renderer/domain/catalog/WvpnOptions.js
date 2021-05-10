import { makeAutoObservable } from 'mobx';

class WvpnOptions {
    ipseckey = null;

    constructor() {    
        makeAutoObservable(this);
    }
};

export default new WvpnOptions();