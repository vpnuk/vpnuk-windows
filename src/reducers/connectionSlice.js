import { createSlice } from '@reduxjs/toolkit';

export const connectionSlice = createSlice({
    name: 'connection',
    initialState: {
        pid: null,
        gateway: null
    },
    reducers: {
        setPid: (state, action) => {
            state.pid = action.payload;
        },
        setGateway: (state, action) => {
            state.gateway = action.payload;
        }
    }
});

export const { setPid, setGateway } = connectionSlice.actions;

export const selectPid = state =>
    state.connection.pid;

export const selectGateway = state =>
    state.connection.gateway;

export default connectionSlice.reducer;