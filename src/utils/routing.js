const { isDev } = require('../../main');

const defaultRoute = '0.0.0.0';

const getDefaultGatewaySync = () => (require('child_process')
    .spawnSync('route', ['print', defaultRoute], { shell: true })
    .stdout + '')
    .split('\r\n')
    .filter(line => // includes('Default');
        line.indexOf(defaultRoute) != line.lastIndexOf(defaultRoute))
    .pop()
    .split(' ')
    .filter(_ => _)[2];
exports.getDefaultGatewaySync = getDefaultGatewaySync;

const deleteRouteSync = (gw, dst = defaultRoute) => require('child_process')
    .spawnSync('route', ['delete', dst, gw], { shell: true })
    .exitCode;
exports.deleteRouteSync = deleteRouteSync;

const addRouteSync = (dst, gw) => require('child_process')
    .spawnSync('route', ['add', dst, 'MASK',
        dst === defaultRoute
            ? defaultRoute
            : '255.255.255.255',
        gw], { shell: true })
    .exitCode;
exports.addRouteSync = addRouteSync;
