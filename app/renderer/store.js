import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import createElectronStorage from 'redux-persist-electron-storage';
import { settingsFolder } from '@modules/constants.js';
import { combineReducers } from 'redux';
import reducers from './reducers';

import ElectronStore from 'electron-store';
const electronStore = new ElectronStore({
    cwd: settingsFolder,
    watch: true
});

const persistConfig = {
    key: 'root',
    storage: createElectronStorage({
        electronStore
    }),
    stateReconciler: autoMergeLevel2,
    whitelist: ['settings']
};

const rootReducer = combineReducers(reducers);
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer);
exports.store = store;

const persistor = persistStore(store);
exports.persistor = persistor;