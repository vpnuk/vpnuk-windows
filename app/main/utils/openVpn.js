const cp = require('child_process');
const fs = require('fs');
const { settingsPath } = require('../../modules/constants');
const { spawnChild } = require('./async');

const isDev = process.env.ELECTRON_ENV === 'Dev';
const isIde = process.env.ELECTRON_IDE && true;

const getOpenVpnExePathSync = (obfuscate = false) => {
    if (process.env.OVPN_EXT_PATH && isDev) {
        return escapeSpaces(process.env.OVPN_EXT_PATH);
    }

    if (obfuscate && fs.existsSync(settingsPath.ovpnBinExe)) {
        return escapeSpaces(settingsPath.ovpnBinExe);
    }

    var exeKey = '' + cp
        .spawnSync('cmd', ['/c\ reg\ query\ HKLM\\SOFTWARE\\OpenVPN\\\ /v\ exe_path'],
            { shell: true })
        .stdout;
    var exePath = exeKey.substring(exeKey.indexOf('REG_SZ') + 6).trim();

    if (fs.existsSync(exePath)) {
        return escapeSpaces(exePath);
    }

    throw new Error('No OpenVPN found.');
};

const escapeSpaces = (value) => {
    return value.replace(' ', '\"\ \"');
};

exports.runOpenVpn = (
    options,
    outStream = process.stdout,
    errStream = process.stderr,
    onExitHandler = code => {
        isDev && console.log(`ovpn exited with code ${code}`);
    },
    onDataHandler = data => {
        isDev && console.log(`ovpn-out: ${data}`);
    },
    onErrorHandler = errData => {
        isDev && console.log(`ovpn-error: ${errData}`);
    }
) => {
    isDev && console.log(options);

    fs.writeFileSync(
        settingsPath.profile,
        `${options.credentials.login}\n${options.credentials.password}`);

    const obfuscate = options.details.protocol.toLowerCase() === 'obfuscation';

    var proc = cp.execFile(
        (isIde ? 'ide' : '') + getOpenVpnExePathSync(obfuscate),
        [
            `--config\ ${obfuscate
                ? escapeSpaces(settingsPath.ovpnObfucation)
                : escapeSpaces(settingsPath.ovpn)}`,
            `--remote\ ${options.server.host}\ ${options.details.port}`,
            `--proto\ ${options.details.protocol.toLowerCase() === 'tcp' ? 'tcp' : 'udp'}`,
            `--auth-user-pass\ ${escapeSpaces(settingsPath.profile)}`,
            options.details.dns.value?.length ? '--redirect-gateway\ def1' : '',
            options.details.dns.value?.length ? Array.from(options.details.dns.value,
                addr => `--dhcp-option\ DNS\ ${addr}`).join(' ') : '',
            options.details.mtu?.value && `--mssfix\n ${'' + options.details.mtu.value}`
        ],
        { shell: true });

    isDev && console.log(proc.spawnargs);

    proc.stdout.pipe(outStream);
    proc.stderr.pipe(errStream);
    proc.stdout.on('data', onDataHandler);
    proc.stderr.on('data', onErrorHandler);
    proc.on('close', onExitHandler);

    return proc;
};

exports.killWindowsProcess = (pid, callback) => {
    var proc = cp.spawn('taskkill', [`/PID\ ${pid}\ /T\ /F`], { shell: true });
    proc.on('close', code => {
        callback(code);
    });
};

exports.killWindowsProcessSync = pid => {
    var code = cp.spawnSync('taskkill', [`/PID\ ${pid}\ /T\ /F`], { shell: true })
        .status;
    isDev && console.log(`kill process PID=${pid} result=${code}`);
    return code;
};

exports.getOvpnAdapterNames = async () =>
    (await spawnChild(getOpenVpnExePathSync(),
        ['--show-adapters'], { shell: true }))
        .split('\r\n')
        .filter(_ => _)
        .slice(1)
        .map(line => line.substring(1, line.indexOf('\'', 1)));
