import { makeAutoObservable } from 'mobx';

class Dns {
    values;

    constructor() {
        makeAutoObservable(this);
        this.values = [];
    }
};

export default new Dns();