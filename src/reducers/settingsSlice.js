import { createSlice } from '@reduxjs/toolkit';

const _emptyProfile = {
    type: 'OpenVPN',
    id: '0',
    label: 'Default',
    credentials: {
        login: '',
        password: ''
    },
    server: {
        host: '',
        label: '',
        type: 'shared'
    },
    details: {
        port: '1194',
        protocol: 'UDP',
        dns: { label: 'No DNS' }, // value: []
        mtu: { value: '1500' }
    }
};

const _currentProfile = settings =>
    settings.profiles
        .find(p => p.id === settings.currentProfile);

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        connectionType: { value: 'OpenVPN', label: 'OpenVPN' },
        profiles: [_emptyProfile],
        currentProfile: '0'
    },
    reducers: {
        increment: state => {
            state.value += 1
        },
        setConnectionType: (state, action) => {
            state.connectionType = action.payload;
        },
        setCurrentProfile: (state, action) => {
            state.currentProfile = action.payload;
        },
        setProfileName: (state, action) => {
            _currentProfile(state).label = action.payload;
        },
        setLogin: (state, action) => {
            _currentProfile(state).credentials.login = action.payload;
        },
        setPassword: (state, action) => {
            _currentProfile(state).credentials.password = action.payload;
        },
        setServer: (state, action) => {
            _currentProfile(state).server = action.payload;
        },
        setPort: (state, action) => {
            _currentProfile(state).details.port = action.payload;
        },
        setProtocol: (state, action) => {
            _currentProfile(state).details.protocol = action.payload;
        },
        setDns: (state, action) => {
            _currentProfile(state).details.dns = action.payload;
        },
        setMtu: (state, action) => {
            _currentProfile(state).details.mtu = action.payload;
        }
    }
});

export const {
    increment,
    setConnectionType,
    setCurrentProfile,
    setProfileName,
    setLogin,
    setPassword,
    setServer,
    setPort,
    setProtocol,
    setDns,
    setMtu
} = settingsSlice.actions;

export const selectConnectionType = state =>
    state.settings.connectionType;

export const selectCurrentProfile = state =>
    _currentProfile(state.settings) ?? _emptyProfile;

export const selectProfilesAvailable = state =>
    state.settings.profiles
        .filter(p => p.type === state.settings.connectionType.value);

export const selectServer = state =>
    selectCurrentProfile(state).server;

export const selectServerName = state =>
    selectCurrentProfile(state).server.label;

export const selectLogin = state =>
    selectCurrentProfile(state).credentials.login;

export const selectDetails = state =>
    selectCurrentProfile(state).details;

export default settingsSlice.reducer;