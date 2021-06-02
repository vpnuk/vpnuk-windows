const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const isDev = process.env.ELECTRON_ENV === 'Dev';
let _sender;

const enableAutoUpdate = sender => {
    _sender = sender;
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates();
};
exports.enableAutoUpdate = enableAutoUpdate;

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
        title: 'VPNUK Update',
        message: `Version ${info.version} is available.\nUpdate now?`,
        buttons: ['Yes', 'No'],
        cancelId: 1
    }) !== 1) {
        _sender.send('auto-update-info', info);
        autoUpdater.downloadUpdate();
    }
});

autoUpdater.on('update-not-available', info => {
    // printUpdateStatus('Update not available.', info);
});

autoUpdater.on('download-progress', progressObj => {
    _sender.send('auto-update-progress', progressObj);
    printUpdateStatus('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', () => {
    _sender.send('auto-update-progress', { percent: 100 });
    printUpdateStatus('Update downloaded. Quitting to install.');
    !isDev && autoUpdater.quitAndInstall();
});

autoUpdater.on('error', err => {
    printUpdateStatus('Error in auto-updater. ' + err);
    dialog.showMessageBoxSync({
        type: 'error',
        title: 'Error updating the app',
        message: err.message
    });
});
