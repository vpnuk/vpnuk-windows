import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';
import { settingsFolder } from './utils/constants';
import rootReducer from './reducers';

import ElectronStore from 'electron-store';
const electronStore = new ElectronStore({
    cwd: settingsFolder
})

const persistConfig = {
    key: 'root',
    storage: createElectronStorage({
        electronStore
    }),
    whitelist: ['settings']
};

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);