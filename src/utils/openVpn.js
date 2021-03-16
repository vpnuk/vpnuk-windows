const { settingsPath } = require('./constants');
const fs = require('fs');

const isDev = process.env.ELECTRON_ENV === 'Dev'

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
};

const escapeSpaces = (value) => {
    return value.replace(' ', '\"\ \"');
};

exports.runOpenVpn = options => {
    isDev && console.log(options);

    fs.writeFileSync(
        settingsPath.profile,
        `${options.credentials.login}\n${options.credentials.password}`);

    var proc = require('child_process')
        .execFile(
            escapeSpaces(getOpenVpnExePath()),
            [
                `--config\ ${escapeSpaces(settingsPath.ovpn)}`,
                `--remote\ ${options.server.host}\ ${options.details.port}`,
                `--proto\ ${options.details.protocol.toLowerCase() === 'tcp' ? 'tcp' : 'udp'}`,
                `--auth-user-pass\ ${escapeSpaces(settingsPath.profile)}`,
                options.details.dns.value?.length && '--redirect-gateway\ def1',
                options.details.dns.value?.length && Array.from(options.details.dns.value,
                    addr => `--dhcp-option\ DNS\ ${addr}`).join(' '),
                options.details.mtu?.value && `--mssfix\n ${'' + options.details.mtu.value}`
            ],
            { shell: true });

    isDev && console.log(proc.spawnargs);

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
};

exports.killWindowsProcess = (pid, callback) => {
    var proc = require('child_process')
        .spawn('taskkill', [`/PID\ ${pid}\ /T\ /F`], { shell: true });

    proc.on('close', code => {
        callback(code);
    });
};

exports.killWindowsProcessSync = pid => {
    var code = require('child_process')
        .spawnSync('taskkill', [`/PID\ ${pid}\ /T\ /F`], { shell: true })
        .exitCode;
    isDev && console.log(`kill process PID=${pid} result=${code}`);
    return code;
};