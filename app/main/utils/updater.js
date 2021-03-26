const path = require('path');
const fs = require('fs');
const StreamZip = require('node-stream-zip');
const { httpsGet, writeFile } = require('./async');
const { settingsPath, settingsLink } = require('../../modules/constants');

const isDev = process.env.ELECTRON_ENV === 'Dev'

const checkExe = exePath => {
    if (fs.existsSync(exePath)) {
        exports.ovpnExePath = exePath;
        isDev && console.log('downloadOvpnExe exe found + export');
        return true;
    }
    return false;
}

exports.downloadOvpnExe = async () => {
    const exePath = path.join(settingsPath.ovpnBinFolder, 'bin', 'openvpn.exe');
    if (checkExe(exePath)) {
        return exePath;
    }

    var link = process.arch === 'x32'
        ? settingsLink.ovpn32zip
        : settingsLink.ovpn64zip;

    const zipFile = path.join(settingsPath.folder,
        path.basename(settingsLink.ovpn64zip));

    const response = await httpsGet(link);
    await writeFile(response, zipFile);

    const zip = new StreamZip.async({ file: zipFile });
    fs.mkdirSync(settingsPath.ovpnBinFolder, { recursive: true });
    await zip.extract(null, settingsPath.ovpnBinFolder);
    await zip.close();

    fs.unlinkSync(zipFile);

    if (checkExe(exePath)) {
        return exePath;
    }

    return null;
}