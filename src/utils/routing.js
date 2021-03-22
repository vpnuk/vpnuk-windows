const cp = require('child_process');
const { stdout, stderr } = require('process');

const defaultRoute = '0.0.0.0';
exports.defaultRoute = defaultRoute;

exports.getDefaultGatewaySync = () =>
    (cp.spawnSync('route', ['print', defaultRoute], { shell: true })
        .stdout + '')
        .split('\r\n')
        .filter(line => // includes('Default');
            line.indexOf(defaultRoute) != line.lastIndexOf(defaultRoute))
        .pop()
        .split(' ')
        .filter(_ => _)[2];

exports.addRouteSync = (dst, gw) =>
    cp.spawnSync('route', ['add', dst, 'MASK',
        dst === defaultRoute
            ? defaultRoute
            : '255.255.255.255',
        gw], { shell: true })
        .status;

exports.deleteRouteSync = (gw, dst = null) =>
    cp.spawnSync('route', ['delete', dst, gw], { shell: true })
        .status;

exports.getIPv6AdaptersSync = () =>
    (cp.spawnSync('powershell',
        ['Get-NetAdapterBinding', '-ComponentID', 'ms_tcpip6'], { shell: true })
        .stdout + '')
        .split('\r\n')
        .filter(_ => _)
        .slice(2)
        .map(line => {
            const words = line.split('  ').filter(_ => _);
            return {
                name: words[0].trim(),
                ipv6Enabled: words.pop().trim() === 'True'
            }
        });

exports.disableIPv6Sync = name => cp.spawnSync(
    'powershell',
    [
        'Start-Process', '-FilePath', 'powershell', '-ArgumentList',
        `@('Disable-NetAdapterBinding', '-Name', '''${name}''', '-ComponentID', 'ms_tcpip6')`,
        '-Verb', 'RunAs', '-WindowStyle', 'Hidden' //'-NoNewWindow'
    ],
    { shell: true }).status;