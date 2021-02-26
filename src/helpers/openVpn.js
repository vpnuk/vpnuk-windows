const childProcess = window
    .require('electron')
    .remote
    .require('child_process');

export const execExternal = (command, args) => {
    var proc = childProcess
        .spawn(command, args, { shell: true });

    console.log(proc);

    proc.stdout.on('data', (data) => {
        console.log(`result: ${data}`);
    });
    proc.stderr.on('data', (data) => {
        console.log(`error: ${data}`);
    });
    proc.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

export const getOpenVpnExePath = () => {
    var exeKey = '' + childProcess
        .spawnSync('cmd', ['/c\ reg\ query\ HKLM\\SOFTWARE\\OpenVPN\\\ /v\ exe_path'],
            { shell: true })
        .stdout;
    
    // todo: check if empty
    var exePath = exeKey.substring(exeKey.indexOf('REG_SZ') + 6).trim();
    
    //console.log('stdout here: \n' + exePath);
    
    return exePath;
}

export class OvpnOptions {
    proto = 'udp';
    host = '84.19.112.105';
    port = '1194';
    gatewayFlag = 'def1';
    dnsAddresses = ['8.8.8.8', '8.8.4.4'];
    mtu = '1500';
};

const escapeSpaces = (value) => {
    return value.replace(' ', '\"\ \"');
}

export const runOpenVpn = (ovpnExePath, configPath, profilePath, ovpnOptions) => {
    console.log(ovpnExePath);
    console.log(configPath);
    console.log(profilePath);
    console.log(ovpnOptions);
    var proc = childProcess
        .execFile(
            escapeSpaces(ovpnExePath),
            [
                `--config\ ${escapeSpaces(configPath)}`,
                `--remote\ ${ovpnOptions.host}\ ${ovpnOptions.port}`,
                `--proto\ ${ovpnOptions.proto}`,
                `--auth-user-pass\ ${escapeSpaces(profilePath)}`,
                `--redirect-gateway\ ${ovpnOptions.gatewayFlag}`,
                Array.from(ovpnOptions.dnsAddresses,
                    addr => `--dhcp-option\ DNS\ ${addr}`).join(' '),
                `--mssfix\n ${'' + ovpnOptions.mtu}`
            ],
            { shell: true });

    console.log(proc);

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