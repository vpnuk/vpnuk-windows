export const optionsConnectionType = [
    { value: 'OpenVPN', label: 'OpenVPN' },
    { value: 'IKEv2', label: 'IKEv2' },
    { value: 'L2TP ', label: 'L2TP ' },
    { value: 'PPTP ', label: 'PPTP ' },
    { value: 'WireGuard', label: 'WireGuard' },
    { value: 'OpenConnect', label: 'OpenConnect' },
];
export const optionsMtu = [
    { value: '1500', label: '1500' },
    { value: '1450', label: '1450' },
    { value: '1400', label: '1400' },
    { value: '1350', label: '1350' },
    { value: '1300', label: '1300' },
    { value: '1250', label: '1250' },
    { value: '1200', label: '1200' },
    { value: '1150', label: '1150' },
    { value: '1100', label: '1100' },
    { value: 'Custom', label: 'Custom' },
];

const baseAddress = 'https://www.serverlistvault.com/';
export const settingsLink = {
    versions: baseAddress + 'versions.json',
    dns: baseAddress + 'dns.json',
    servers: baseAddress + 'servers.json',
    ovpn: baseAddress + 'openvpn-configuration.ovpn',
    ovpnObfucation: baseAddress + 'openvpn-obfuscation-configuration.ovpn'
}

const path = require('path');
// This folder should be created during the installation process
const settingsFolder = path.resolve(require('process').env.APPDATA + '\\VPNUK');
export const settingsPath = {
    folder: settingsFolder,
    versions: path.join(settingsFolder, 'versions.json'),
    dns: path.join(settingsFolder, 'dns.json'),
    servers: path.join(settingsFolder, 'servers.json'),
    ovpn: path.join(settingsFolder, 'openvpn-configuration.ovpn'),
    ovpnObfucation: path.join(settingsFolder, 'openvpn-obfuscation-configuration.ovpn')
}
