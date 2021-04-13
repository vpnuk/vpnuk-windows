import catalogReducer from './catalogSlice';
import connectionReducer from './connectionSlice';
import settingsReducer from './settingsSlice';

const reducers = {
    settings: settingsReducer,
    catalog: catalogReducer,
    connection: connectionReducer
};

export default reducers;