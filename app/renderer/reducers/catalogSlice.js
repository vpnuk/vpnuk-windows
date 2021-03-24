import { createSlice } from '@reduxjs/toolkit';

export const catalogSlice = createSlice({
    name: 'catalog',
    initialState: {
        dns: [],
        servers: {}
    },
    reducers: {
        setDns: (state, action) => {
            state.dns = action.payload;
        },
        setServers: (state, action) => {
            state.servers = action.payload;
        }
    }
});

export const { setDns, setServers } = catalogSlice.actions;

export const selectDnsCalalog = state =>
    state.catalog.dns;

export const selectServerCatalog = state =>
    state.catalog.servers;

export default catalogSlice.reducer;