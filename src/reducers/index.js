import { combineReducers } from 'redux';
import catalogReducer from './catalogSlice';
import connectionReducer from './connectionSlice';
import settingsReducer from './settingsSlice'; 

export default combineReducers({
    settings: settingsReducer,
    catalog: catalogReducer,
    connection: connectionReducer
});