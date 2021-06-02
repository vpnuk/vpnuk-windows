const { OpenVpn, getOvpnAdapterNames, installOvpnUpdate } = require('./OpenVpn');
const WindowsVpn = require('./WindowsVpn');
const { VpnType } = require('../../modules/constants');

function createVpn(profile, hooks, wVpnOptions) {
    let result;
    switch (profile.vpnType) {
        case VpnType.OpenVPN.label:
            result = new OpenVpn(profile, hooks);
            break;
        case VpnType.L2TP.label:
        case VpnType.PPTP.label:
        case VpnType.IKEv2.label:
            result = new WindowsVpn(profile, hooks, wVpnOptions);
            break;
        default:
            throw new TypeError(`Wrong vpn type: ${[profile.vpnType]}`);
    }
    return result;
}

module.exports = { createVpn, getOvpnAdapterNames, installOvpnUpdate };
