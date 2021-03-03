import { settingsPath } from '../settings/settings';

const isDev = require('electron-is-dev');
const fs = require('fs');
const childProcess = window
    .require('electron')
    .remote
    .require('child_process');

const getOpenVpnExePath = () => {
    var exeKey = '' + childProcess
        .spawnSync('cmd', ['/c\ reg\ query\ HKLM\\SOFTWARE\\OpenVPN\\\ /v\ exe_path'],
            { shell: true })
        .stdout;
    var exePath = exeKey.substring(exeKey.indexOf('REG_SZ') + 6).trim();

    if (fs.existsSync(exePath)) {
        return (isDev ? 'dev_' : '') + exePath;
    }

    throw new Error('No OpenVPN found');
}

export class OvpnOptions {
    proto = 'udp';
    host = '84.19.112.105';
    port = '1194';
    dnsAddresses = ['8.8.8.8', '8.8.4.4'];
    mtu = '1500';
};

const escapeSpaces = (value) => {
    return value.replace(' ', '\"\ \"');
}

export const runOpenVpn = (ovpnOptions) => {
    isDev && console.log(ovpnOptions);
    var proc = childProcess
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

export const killWindowsProcess = (cp, pid) => {
    var proc = cp
        .spawn('taskkill', [`/PID\ ${pid}\ /T\ /F`],
            { shell: true });

    proc.on('close', (code) => {
        console.log(`killed process PID=${pid} result=${code}`);
    });
}

export const killWindowsProcessSync = (pid) => {
    var code = require('child_process')
      .spawnSync('taskkill', [`/PID\ ${pid}\ /T\ /F`], { shell: true })
      .exitCode;
    console.log(`kill process PID=${pid} result=${code}`);
  }
  