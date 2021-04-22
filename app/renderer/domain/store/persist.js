import ElectronStore from 'electron-store';
import { StorageAdapter, persistence } from 'mobx-persist-store';

const storage = new ElectronStore();

const persistAdapter = new StorageAdapter({
    read: name => new Promise(resolve => resolve(storage.get(name))),
    write: (name, content) => new Promise(resolve => resolve(storage.set(name, content))),
});

const persist = (store, name, props) => persistence({
    name: name,
    properties: props,
    adapter: persistAdapter,
})(store);

export default persist;