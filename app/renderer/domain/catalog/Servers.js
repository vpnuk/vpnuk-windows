import { makeAutoObservable, runInAction } from 'mobx';

class Servers {
    shared;
    dedicated;
    dedicated11;
    
    constructor() {
        makeAutoObservable(this);
        runInAction(() => {
            this.shared = [];
            this.dedicated = [];
            this.dedicated11 = [];
        });
    }

    /**
     * @param {{ shared: any[]; dedicated: any[]; dedicated11: any[]; }} value
     */
    set values(value) {
        this.shared = value.shared;
        this.dedicated = value.dedicated;
        this.dedicated11 = value.dedicated11;
    }

}

export default new Servers();