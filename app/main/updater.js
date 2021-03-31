const { dialog } = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('path');

const isDev = process.env.ELECTRON_ENV === 'Dev';

const printUpdateStatus = (message, arg = null) => {
    isDev && console.log(message, arg);
}

autoUpdater.on('checking-for-update', () => {
    printUpdateStatus('Checking for update...');
});

autoUpdater.on('update-available', info => {
    printUpdateStatus('Update available.', info);
    if (dialog.showMessageBoxSync({
        type: 'info',
        icon: path.join(__dirname, '../assets/icon.ico'),
        title: 'VPNUK Update available',
        message: 'Download?',
        buttons: ['Yes', 'No'],
        cancelId: 1
    }) !== 1) {
        autoUpdater.downloadUpdate();
    }
});

autoUpdater.on('update-not-available', info => {
    printUpdateStatus('Update not available.', info);
});

autoUpdater.on('download-progress', progressObj => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    printUpdateStatus('download-progress', log_message);
});

autoUpdater.on('update-downloaded', info => {
    printUpdateStatus('Update downloaded. Quitting to install.', info);
    if (dialog.showMessageBoxSync({
        type: 'info',
        icon: path.join(__dirname, '../assets/icon.ico'),
        title: 'VPNUK Update downloaded',
        message: 'Install now?',
        buttons: ['Yes', 'No'],
        cancelId: 1
    }) !== 1) {
        autoUpdater.quitAndInstall();
    }
});

autoUpdater.on('error', err => {
    printUpdateStatus('Error in auto-updater. ' + err);
});