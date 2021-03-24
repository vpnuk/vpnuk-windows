const optionsConnectionType = [
    { value: 'OpenVPN', label: 'OpenVPN' },
    { value: 'IKEv2', label: 'IKEv2', isDisabled: true },
    { value: 'L2TP', label: 'L2TP', isDisabled: true },
    { value: 'PPTP', label: 'PPTP', isDisabled: true },
    { value: 'WireGuard', label: 'WireGuard', isDisabled: true },
    { value: 'OpenConnect', label: 'OpenConnect', isDisabled: true }
];
exports.optionsConnectionType = optionsConnectionType;

exports.optionsMtu = [
    { value: '1500', label: 'MTU: 1500' },
    { value: '1450', label: 'MTU: 1450' },
    { value: '1400', label: 'MTU: 1400' },
    { value: '1350', label: 'MTU: 1350' },
    { value: '1300', label: 'MTU: 1300' },
    { value: '1250', label: 'MTU: 1250' },
    { value: '1200', label: 'MTU: 1200' },
    { value: '1150', label: 'MTU: 1150' },
    { value: '1100', label: 'MTU: 1100' },
];

exports.protoAndPorts = [
    { label: 'TCP', protocol: 'tcp', ports: ['443', '80', '8008'] },
    { label: 'UDP', protocol: 'udp', ports: ['1194', '55194', '65194'] },
    { label: 'Obfuscation', protocol: 'tcp', ports: ['443'] }
];

const path = require('path');
// This folder should be created during the installation process
const settingsFolder = path.resolve(require('process').env.APPDATA + '\\VPNUK');
exports.settingsFolder = settingsFolder;

const settingsPath = {
    folder: settingsFolder,
    versions: path.join(settingsFolder, 'versions.json'),
    dns: path.join(settingsFolder, 'dns.json'),
    servers: path.join(settingsFolder, 'servers.json'),
    ovpn: path.join(settingsFolder, 'openvpn-configuration.ovpn'),
    ovpnObfucation: path.join(settingsFolder, 'openvpn-obfuscation-configuration.ovpn'),
    profile: path.join(settingsFolder, 'profile.txt')
};
exports.settingsPath = settingsPath;