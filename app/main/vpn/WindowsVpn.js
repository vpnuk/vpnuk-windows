const { connectionStates, VpnType } = require('../../modules/constants');
const { spawnChild } = require('../utils/async');
const VpnBase = require('./VpnBase');

class WindowsVpn extends VpnBase {
    #ipseckey;

    constructor(profile, hooks, wVpnOptions) {
        super(profile, hooks);
        this.#ipseckey = wVpnOptions.ipseckey;
    }

    async connect() {
        this._connectingHook?.();
        if (await this.getConnectionStatus() === connectionStates.connected) {
            await this.#rasdialDisconnect();
        }
        if (await this.getConnectionStatus() === connectionStates.disconnected) {
            await this.#removeConnection();
        }
        await this.#addConnection();
        await this.#rasdialConnect();
        if (await this.getConnectionStatus() === connectionStates.connected) {
            this._connectedHook?.();
        }
        else {
            await this.#removeConnection();
            this._logStream.end();
            this._disconnectedHook?.();
            this._errorHook?.(new Error(`${this._name} connection error.`));
        }
    }

    async disconnect() {
        if (await this.getConnectionStatus() === connectionStates.connected) {
            await this.#rasdialDisconnect();
        }
        if (await this.getConnectionStatus() === connectionStates.disconnected) {
            await this.#removeConnection();
        }
        this._disconnectedHook?.();
    }

    async getConnectionStatus() {
        try {
            return (await this.#logSpawn('powershell', [
                'Get-VpnConnection -Name', this._name,
                '| Select -ExpandProperty ConnectionStatus'
            ])).trim();
        }
        catch { // error if there are no connection, ok with that
            return null;
        }
    }

    async #removeConnection() {
        return await this.#logSpawn('powershell', [
            'Remove-VpnConnection -Name', this._name, '-Force'
        ]);
    }

    async #addConnection() {
        return await this.#logSpawn('powershell', [
            'Add-VpnConnection',
            '-Name', this._name,
            '-TunnelType', this.type,
            '-ServerAddress', this._server.host, // todo: use dns name for ike2
            this.type === VpnType.L2TP.label ? `-L2tpPsk ${this.#ipseckey}` : '',
            '-AuthenticationMethod Chap, MsChapv2', // todo: check for pptp and ikev2
            '-Force -RememberCredential -PassThru'
        ]);
    }

    async #rasdialConnect() {
        return await this.#logSpawn('powershell', [
            'rasdial',
            this._name,
            this._credentials.login,
            this._credentials.password
        ]);
    }

    async #rasdialDisconnect() {
        return await this.#logSpawn('powershell',
            ['rasdial', this._name, '/d']);
    }

    async #logSpawn(cmd, args) {
        let result = await spawnChild(cmd, args);
        this._logStream.write(result);
        return result;
    }
};

module.exports = WindowsVpn;