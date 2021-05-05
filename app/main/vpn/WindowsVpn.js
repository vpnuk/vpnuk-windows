const cp = require('child_process');
const { connectionStates } = require('../../modules/constants');
const VpnBase = require('./VpnBase');

class WindowsVpn extends VpnBase {
    constructor(profile, hooks) {
        super(profile, hooks);
    }

    connect() {
        this._connectingHook?.();
        if (this.getConnectionStatus() === connectionStates.disconnected) {
            this.#removeConnection();
        }
        if (this.#addConnection() === 0
            && this.#rasdialConnect() === 0
            && this.getConnectionStatus() === connectionStates.connected) {
            this._connectedHook?.();
        }
        else {
            this.#removeConnection();
            this._disconnectedHook?.();
            this._errorHook?.(new Error(`${this._name} connection error.`));
        }
    }

    disconnect() {
        if (this.getConnectionStatus() === connectionStates.connected) {
            this.#rasdialDisconnect();
        }
        if (this.getConnectionStatus() === connectionStates.disconnected) {
            this.#removeConnection();
        }
        this._disconnectedHook?.();
    }

    getConnectionStatus() {
        return ('' + cp.spawnSync('powershell', [
            'Get-VpnConnection -Name', this._name,
            '| Select -ExpandProperty ConnectionStatus'
        ]).stdout).trim();
    }

    #removeConnection() {
        return this.#logSpawnSync('powershell', [
            'Remove-VpnConnection -Name', this._name, '-Force'
        ]).status;
    }

    #addConnection(ipseckey = '69000903') {
        return this.#logSpawnSync('powershell', [
            'Add-VpnConnection',
            '-Name', this._name,
            '-TunnelType', this.type,
            '-ServerAddress', this._server.host, // todo: dns name with ike2
            ipseckey ? `-L2tpPsk ${ipseckey}` : '', // l2tp only // get from catalogs
            '-AuthenticationMethod Chap, MsChapv2', // todo: check for pptp and ikev2
            '-Force -RememberCredential -PassThru'
        ]).status;
    }

    #rasdialConnect() {
        return this.#logSpawnSync('powershell', [
            'rasdial',
            this._name,
            this._credentials.login,
            this._credentials.password
        ]).status;
    }

    #rasdialDisconnect() {
        return this.#logSpawnSync('powershell',
            ['rasdial', this._name, '/d'])
            .status;
    }

    #logSpawnSync(cmd, args) {
        let proc = cp.spawnSync(cmd, args);
        this._logStream.write(proc.stderr);
        this._logStream.write(proc.stdout);
        return proc;
    }
};

module.exports = WindowsVpn;