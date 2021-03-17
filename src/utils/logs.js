const { settingsFolder } = require('./constants');
const path = require('path');
const fs = require('fs');
const isDev = process.env.ELECTRON_ENV === 'Dev'

const logDir = path.join(settingsFolder, 'logs');
const mkdirIfNotExistsSync = path => !fs.existsSync(path) && fs.mkdirSync(path, { recursive: true });

const getLogPath = id =>
    path.join(logDir, id + '.log');

const getLogFileStream = id => {
    mkdirIfNotExistsSync(logDir);
    const logPath = getLogPath(id);
    isDev && console.log(logPath);
    return fs.createWriteStream(logPath);
};
exports.getLogFileStream = getLogFileStream;

const openLogFileExternal = id => {
    var proc = require('child_process')
        .execFile('start', [getLogPath(id)]);
    isDev && console.log(proc.spawnargs);
    return proc;
}
exports.openLogFileExternal = openLogFileExternal;