const axios = require('axios');
const fs = require('fs');

const baseAddress = 'https://www.serverlistvault.com/';
const settingsLink = {
    versions: baseAddress + 'versions.json',
    dns: baseAddress + 'dns.json',
    servers: baseAddress + 'servers.json',
    ovpn: baseAddress + 'openvpn-configuration.ovpn',
    ovpnObfucation: baseAddress + 'openvpn-obfuscation-configuration.ovpn'
}

const path = require('path');
// This folder should be created during the installation process
const settingsFolder = path.resolve(require('process').env.APPDATA + '\\VPNUK');
const settingsPath = {
    folder: settingsFolder,
    versions: path.join(settingsFolder, 'versions.json'),
    dns: path.join(settingsFolder, 'dns.json'),
    servers: path.join(settingsFolder, 'servers.json'),
    ovpn: path.join(settingsFolder, 'openvpn-configuration.ovpn'),
    ovpnObfucation: path.join(settingsFolder, 'openvpn-obfuscation-configuration.ovpn'),
    profile: path.join(settingsFolder, 'profile.txt'),
    settings: path.join(settingsFolder, 'settings.json'),
};
exports.settingsPath = settingsPath;

const dowloadOvpnConfig = (link, filePath) =>
    axios
        .get(link)
        .then((response) => {
            var file = fs.openSync(filePath, 'w');
            ('' + response.data).split('\n').forEach(line => {
                if (!(line.startsWith('#')
                    || line.startsWith('proto')
                    || line.startsWith('remote')
                    || line.startsWith('auth-user-pass'))) {

                    fs.appendFileSync(file, line + '\n');
                }
            });
            fs.closeSync(file);
        })
        .catch((error) => {
            console.log('error', error);
        });

const dowloadJson = (link, filePath) =>
    axios
        .get(link)
        .then((response) => {
            fs.writeFileSync(filePath, JSON.stringify(response.data, undefined, 2));
        })
        .catch((error) => {
            console.log('error', error);
        });

const handlerServerDnsStructure = (arr) => [
    { value: null, label: 'No DNS' },
    ...arr.map(dnsItem => ({
        label: dnsItem.name,
        value: [dnsItem.primary, dnsItem.secondary]
    }))
];

const handlerServerTypesStructure = (arr, types) =>
    Object.assign({}, ...types.map(type => ({
        [type]: arr
            .filter(server => server.type === type)
            .map(server => ({
                label: server.location.name,
                host: server.address,
                type: server.type
            }))
    })));

exports.initializeSettings = () => {
    if (!fs.existsSync(settingsPath.folder)) {
        fs.mkdirSync(settingsPath.folder);
    };

    const oldVers = fs.existsSync(settingsPath.versions)
        ? JSON.parse(fs.readFileSync(settingsPath.versions))
        : null;

    return axios.get(settingsLink.versions)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log('error', error);
        })
        .then((newVers) => {
            if (!oldVers && newVers) {
                fs.writeFileSync(settingsPath.versions, JSON.stringify(newVers, undefined, 2));
            }
            var dowloads = [];
            if (!oldVers || (oldVers.ovpn !== newVers.ovpn)
                || !fs.existsSync(settingsPath.ovpn) || !fs.existsSync(settingsPath.ovpnObfucation)) {
                dowloads.push(dowloadOvpnConfig(settingsLink.ovpn, settingsPath.ovpn));
                dowloads.push(dowloadOvpnConfig(settingsLink.ovpnObfucation, settingsPath.ovpnObfucation));
            }
            if (!oldVers || (oldVers.servers !== newVers.servers) || !fs.existsSync(settingsPath.servers)) {
                dowloads.push(dowloadJson(settingsLink.servers, settingsPath.servers));
            }
            if (!oldVers || (oldVers.dns !== newVers.dns) || !fs.existsSync(settingsPath.dns)) {
                dowloads.push(dowloadJson(settingsLink.dns, settingsPath.dns));
            }
            return Promise.all(dowloads);
        })
        .then(() => {
            return Promise.all([
                JSON.parse(fs.readFileSync(settingsPath.dns)),
                JSON.parse(fs.readFileSync(settingsPath.servers))]);
        })
        .then((result) => {
            return {
                dns: handlerServerDnsStructure(result[0].dns),
                servers: handlerServerTypesStructure(result[1].servers,
                    ['shared', 'dedicated', 'dedicated11'])
            }
        });
};

exports.emptySettings = {
    connectionType: 'OpenVPN',
    protocol: '',
    port: '',
    server: {
        host: '',
        name: '',
        type: ''
    },
    dns: {
        name: '',
        addresses: null
    },
    mtu: '',
    profile: {
        login: '',
        password: ''
    }
};

const _emptyProfile = {
    id: '0',
    label: 'Default',
    config: {
        credentials: {
            login: '',
            password: ''
        },
        server: {
            host: '',
            label: '',
            type: ''
        },
        port: '',
        protocol: '',
        dns: {
            name: '',
            addresses: null // ['IP1', 'IP2']
        },
        mtu: ''
    }
};
exports._emptySettings = {
    currentType: 'OpenVpn',
    currentProfile: 'Default',
    profiles: {
        'OpenVpn': [_emptyProfile]
    }
};
