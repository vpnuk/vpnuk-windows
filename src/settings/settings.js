import axios from 'axios';
import { settingsLink, settingsPath } from './constants';
const fs = require('fs');

const dowloadOvpnConfig = (link, filePath) =>
    axios
        .get(link)
        .then((response) => {
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
        .catch((error) => {
            console.log('error', error);
        });

const dowloadJson = (link, filePath) =>
    axios
        .get(link)
        .then((response) => {
            fs.writeFileSync(filePath, JSON.stringify(response.data, undefined, 2));
        })
        .catch((error) => {
            console.log('error', error);
        });

export const initializeSettings = () => {
    if (!fs.existsSync(settingsPath.folder)) {
        fs.mkdirSync(settingsPath.folder);
    };

    const oldVers = fs.existsSync(settingsPath.versions)
        ? JSON.parse(fs.readFileSync(settingsPath.versions))
        : null;

    return axios.get(settingsLink.versions)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log('error', error);
        })
        .then((newVers) => {
            if (!oldVers && newVers) {
                fs.writeFileSync(settingsPath.versions, JSON.stringify(newVers, undefined, 2));
            }
            var dowloads = [];
            if (!oldVers || (oldVers.ovpn !== newVers.ovpn)
                || !fs.existsSync(settingsPath.ovpn) || !fs.existsSync(settingsPath.ovpnObfucation)) {
                dowloads.push(dowloadOvpnConfig(settingsLink.ovpn, settingsPath.ovpn));
                dowloads.push(dowloadOvpnConfig(settingsLink.ovpnObfucation, settingsPath.ovpnObfucation));
            }
            if (!oldVers || (oldVers.servers !== newVers.servers) || !fs.existsSync(settingsPath.servers)) {
                dowloads.push(dowloadJson(settingsLink.servers, settingsPath.servers));
            }
            if (!oldVers || (oldVers.dns !== newVers.dns) || !fs.existsSync(settingsPath.dns)) {
                dowloads.push(dowloadJson(settingsLink.dns, settingsPath.dns));
            }
            return Promise.all(dowloads);
        })
        .then(() => {
            return Promise.all([
                JSON.parse(fs.readFileSync(settingsPath.dns)),
                JSON.parse(fs.readFileSync(settingsPath.servers))]);
        })
        .then((result) => {
            return {
                dns: result[0],
                servers: result[1]
            }
        });
}