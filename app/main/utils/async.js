const cp = require('child_process');
exports.spawnChild = async (command, args, options) => {
    const child = cp.spawn(command, args, options);

    let data = "";
    for await (const chunk of child.stdout) {
        data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
        error += chunk;
    }
    const exitCode = await new Promise((resolve, _) => {
        child.on('close', resolve);
    });

    if (exitCode) {
        throw new Error(`subprocess error exit ${exitCode}, ${error}`);
    }
    return data;
}

const https = require('https');
exports.httpsGet = async url =>
    new Promise((resolve, reject) => {
        let req = https.get(url);

        req.on('response', res => {
            resolve(res);
        });

        req.on('error', err => {
            reject(err);
        });
    });

const fs = require('fs');
exports.writeFile = async (stream, fileName) =>
    new Promise((resolve, reject) => {
        let writer = fs.createWriteStream(fileName);
        stream.pipe(writer);

        writer.on('finish', () => {
            resolve();
        });

        writer.on('error', err => {
            reject(err);
        });
    });