const { settingsFolder } = require('./constants');
const path = require('path');
const fs = require('fs');
const isDev = process.env.ELECTRON_ENV === 'Dev'

const logDir = path.join(settingsFolder, 'logs');
const mkdirIfNotExistsSync = path => !fs.existsSync(path) && fs.mkdirSync(path, { recursive: true });

const getLogFileStream = id => {
    mkdirIfNotExistsSync(logDir);
    const logPath = path.join(logDir, id + '.log');
    isDev && console.log(logPath);
    return fs.createWriteStream(logPath);
};
exports.getLogFileStream = getLogFileStream;