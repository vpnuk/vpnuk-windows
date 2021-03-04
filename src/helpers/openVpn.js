const { settingsPath } = require('../settings/settings');
const isDev = require('electron-is-dev');
const fs = require('fs');

const getOpenVpnExePath = () => {
    var exeKey = '' + require('child_process')
        .spawnSync('cmd', ['/c\ reg\ query\ HKLM\\SOFTWARE\\OpenVPN\\\ /v\ exe_path'],
            { shell: true })
        .stdout;
    var exePath = exeKey.substring(exeKey.indexOf('REG_SZ') + 6).trim();

    if (fs.existsSync(exePath)) {
        return (isDev ? 'dev_' : '') + exePath;
    }

    throw new Error('No OpenVPN found');
}

const escapeSpaces = (value) => {
    return value.replace(' ', '\"\ \"');
}

exports.runOpenVpn = (ovpnOptions) => {
    isDev && console.log(ovpnOptions);
    var proc = require('child_process')
        .execFile(
            escapeSpaces(getOpenVpnExePath()),
            [
                `--config\ ${escapeSpaces(settingsPath.ovpn)}`,
                `--remote\ ${ovpnOptions.host}\ ${ovpnOptions.port}`,
                `--proto\ ${ovpnOptions.proto}`,
                `--auth-user-pass\ ${escapeSpaces(settingsPath.profile)}`,
                ovpnOptions.dnsAddresses && '--redirect-gateway\ def1',
                ovpnOptions.dnsAddresses && Array.from(ovpnOptions.dnsAddresses,
                    addr => `--dhcp-option\ DNS\ ${addr}`).join(' '),
                ovpnOptions.mtu && `--mssfix\n ${'' + ovpnOptions.mtu}`
            ],
            { shell: true });

    isDev && console.log(proc.spawnargs);

    proc.on('SIGHUP', () => {
        console.log('received SIGHUP')
    });

    proc.on('SIGTERM', () => {
        console.log('received SIGTERM')
    });

    proc.stdout.on('data', (data) => {
        console.log(`ovpn-out: ${data}`);
    });
    proc.stderr.on('data', (data) => {
        console.log(`ovpn-error: ${data}`);
    });
    proc.on('close', (code) => {
        console.log(`ovpn exited with code ${code}`);
    });

    return proc;
}

exports.killWindowsProcessSync = pid => {
    var code = require('child_process')
        .spawnSync('taskkill', [`/PID\ ${pid}\ /T\ /F`], { shell: true })
        .exitCode;
    isDev && console.log(`kill process PID=${pid} result=${code}`);
    return code;
}
