import { createSlice } from '@reduxjs/toolkit';
import { connectionStates } from '@modules/constants.js';

export const connectionSlice = createSlice({
    name: 'connection',
    initialState: {
        conState: connectionStates.disconnected,
        gateway: null
    },
    reducers: {
        setConState: (state, action) => {
            state.conState = action.payload;
        },
        setGateway: (state, action) => {
            state.gateway = action.payload;
        }
    }
});

export const { setConState, setGateway } = connectionSlice.actions;

export const selectConState = state =>
    state.connection.conState;

export const selectGateway = state =>
    state.connection.gateway;

export default connectionSlice.reducer;