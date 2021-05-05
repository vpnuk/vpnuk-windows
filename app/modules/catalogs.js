const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { settingsPath, settingsLink } = require('./constants');
const AdmZip = require('adm-zip');;

const dowloadOvpnConfig = (link, filePath) =>
    axios
        .get(link)
        .then(response => {
            var file = fs.openSync(filePath, 'w');
            ('' + response.data).split('\n').forEach(line => {
                if (!(line.startsWith('#')
                    || line.startsWith('proto')
                    || line.startsWith('remote')
                    || line.startsWith('auth-user-pass'))) {

                    fs.appendFileSync(file, line + '\n');
                }
            });
            fs.closeSync(file);
        })
        .catch(error => console.log('error', error));

const dowloadJson = (link, filePath) =>
    axios
        .get(link)
        .then(response => fs.writeFileSync(
            filePath, JSON.stringify(response.data, undefined, 2)))
        .catch(error => console.log('error', error));

const downloadPatchedOvpnExe = links => {
    let link = getLinkByArch(links);
    if (fs.existsSync(settingsPath.ovpnBinFolder)) {
        fs.rmdirSync(settingsPath.ovpnBinFolder, { recursive: true });
    }
    const zipFile = path.join(require('os').tmpdir(), '\\', path.basename(link));
    return axios
        .get(link, { responseType: 'arraybuffer' })
        .then(response => fs.writeFileSync(zipFile, new Buffer.from(response.data)))
        .catch(error => console.log('error', error))
        .then(() => {
            let success = false;
            try {
                let zip = new AdmZip(zipFile);
                fs.mkdirSync(settingsPath.ovpnBinFolder, { recursive: true });
                zip.extractAllTo(settingsPath.ovpnBinFolder, true);
                success = true;
            } catch (error) {
                console.log('error', error)
            } finally {
                if (fs.existsSync(zipFile)) {
                    fs.unlinkSync(zipFile);
                }
            }
            return success;
        });
};
exports.downloadPatchedOvpnExe = downloadPatchedOvpnExe;

exports.downloadOvpnUpdate = links => {
    let link = getLinkByArch(links);
    let file = path.resolve(require('os').tmpdir() + '\\' + path.basename(link));
    return axios
        .get(link, { responseType: 'arraybuffer' })
        .then(response => fs.writeFileSync(file, new Buffer.from(response.data)))
        .catch(error => console.log('error', error))
        .then(() => { return file; });
};

const handlerServerDnsStructure = arr => [
    { value: [], label: 'DNS: Default' },
    ...arr.map(dnsItem => ({
        label: dnsItem.name,
        value: [dnsItem.primary, dnsItem.secondary]
    }))
];

const handlerServerTypesStructure = (arr, types) =>
    Object.assign({}, ...types.map(type => ({
        [type]: arr
            .filter(server => server.type === type)
            .map(server => ({
                label: server.location.name,
                host: server.address,
                type: server.type
            }))
    })));

const isObfuscateAvailable = () => fs.existsSync(settingsPath.ovpnBinExe);
exports.isObfuscateAvailable = isObfuscateAvailable;

const getVersions = file => fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file)) : null;

const getLinkByArch = node => process.arch === 'x32'
    ? node.win32 : node.win64;

exports.initializeCatalogs = () => {
    if (!fs.existsSync(settingsPath.folder)) {
        fs.mkdirSync(settingsPath.folder);
    };
    const oldVers = getVersions(settingsPath.versions);

    return axios.get(settingsLink.versions)
        .then(response => response.data)
        .catch(error => console.log('error', error))
        .then(newVers => {
            var downloads = [];
            if (!oldVers || (oldVers.ovpn !== newVers.ovpn)
                || !fs.existsSync(settingsPath.ovpn) || !fs.existsSync(settingsPath.ovpnObfucation)) {
                downloads.push(dowloadOvpnConfig(settingsLink.ovpn, settingsPath.ovpn));
                downloads.push(dowloadOvpnConfig(settingsLink.ovpnObfucation, settingsPath.ovpnObfucation));
            }
            if (!oldVers || (oldVers.servers !== newVers.servers) || !fs.existsSync(settingsPath.servers)) {
                downloads.push(dowloadJson(settingsLink.servers, settingsPath.servers));
            }
            if (!oldVers || (oldVers.dns !== newVers.dns) || !fs.existsSync(settingsPath.dns)) {
                downloads.push(dowloadJson(settingsLink.dns, settingsPath.dns));
            }
            if (!oldVers || !fs.existsSync(settingsPath.ovpnBinExe)) { // silent download for the first time
                downloads.push(downloadPatchedOvpnExe(newVers.openvpn.patch));
            }
            if (newVers && (!oldVers || downloads.length > 0)) {
                fs.writeFileSync(settingsPath.versions, JSON.stringify(newVers, undefined, 2));
            }
            return Promise.all(downloads);
        })
        .then(() => {
            return Promise.all([
                JSON.parse(fs.readFileSync(settingsPath.dns)),
                JSON.parse(fs.readFileSync(settingsPath.servers))]);
        })
        .then(result => {
            return {
                dns: handlerServerDnsStructure(result[0].dns),
                servers: handlerServerTypesStructure(result[1].servers,
                    ['shared', 'dedicated', 'dedicated11']),
                isObfuscateAvailable: isObfuscateAvailable()
            };
        });
};

exports.checkOvpnUpdates = () => {
    const oldVers = getVersions(settingsPath.versions);
    return axios.get(settingsLink.versions)
        .then(response => response.data)
        .catch(error => console.log('error', error))
        .then(newVers => {
            if (!oldVers.openvpn || oldVers.openvpn.version !== newVers.openvpn.version) {
                return newVers.openvpn;
            }
        });
};