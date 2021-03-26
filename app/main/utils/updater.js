const axios = require('axios');
const path = require('path');
const fs = require('fs');
const StreamZip = require('node-stream-zip');

const { settingsPath, settingsLink } = require('../../modules/constants');

exports.downloadOvpnExe = async () => {
    const exePath = path.join(settingsPath.ovpnBinFolder, 'bin', 'openvpn.exe');
    if (fs.existsSync(exePath)) {
        exports.ovpnExePath = exePath;
    }

    var link = process.arch === 'x32'
        ? settingsLink.ovpn32zip
        : settingsLink.ovpn64zip;

    const zipFile = path.join(settingsPath.folder,
        path.basename(settingsLink.ovpn64zip));
    
    const writer = fs.createWriteStream(zipFile);

    const response = await axios({
        url: link,
        method: 'get',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    writer.on('finish', async () => {
        const zip = new StreamZip.async({ file: zipFile });
        fs.mkdirSync(settingsPath.ovpnBinFolder, { recursive: true });
        await zip.extract(null, settingsPath.ovpnBinFolder);
        await zip.close();
        
        if (fs.existsSync(exePath)) {
            exports.ovpnExePath = exePath;
        }
    });

    writer.on('error', err => {
        console.log('zip save error', err);
    });
}