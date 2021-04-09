import { createSlice } from '@reduxjs/toolkit';
import { protoAndPorts } from '@modules/constants.js';

export const catalogSlice = createSlice({
    name: 'catalog',
    initialState: {
        dns: [],
        servers: {
            shared: [],
            dedicated: [],
            dedicated11: []
        },
        protoAndPorts: protoAndPorts,
        isObfuscateAvailable: true
    },
    reducers: {
        setDns: (state, action) => {
            state.dns = action.payload;
        },
        setServers: (state, action) => {
            state.servers = action.payload;
        },
        setObfuscateAvailable: (state, action) => {
            state.isObfuscateAvailable = action.payload && true;
            state.protoAndPorts = protoAndPorts.filter(pp =>
                pp.label !== 'Obfuscation' ||
                (pp.label === 'Obfuscation' && state.isObfuscateAvailable)
            );
        },
    }
});

export const {
    setDns,
    setServers,
    setObfuscateAvailable
} = catalogSlice.actions;

export const selectDnsCalalog = state =>
    state.catalog.dns;

export const selectServerCatalog = state =>
    state.catalog.servers;

export const selectProtoAndPorts = state =>
    state.catalog.protoAndPorts;

export default catalogSlice.reducer;