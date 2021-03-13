import { createSlice } from '@reduxjs/toolkit';

export const connectionSlice = createSlice({
    name: 'connection',
    initialState: {
        pid: null
    },
    reducers: {
        setPid: (state, action) => {
            state.pid = action.payload;
        }
    }
});

export const { setPid } = connectionSlice.actions;

export const selectPid = state =>
    state.connection.pid;

export default connectionSlice.reducer;