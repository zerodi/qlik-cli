const
    fs = require('fs'),
    path = require('path'),
    Promise = require('promise');

module.exports = settings => {
    const appPath = path.resolve(path.join(settings.path, settings.app));

    return new Promise((resolve, reject) => {
        if (!fs.existsSync(appPath)) {
            reject(`Directory not found: ${appPath}`);

            return;
        }

        const data = {};
        const fileList = fs.readdirSync(appPath);
        fileList.forEach(file => {
            const
                name = path.basename(file, path.extname(file)),
                fullPath = path.join(appPath, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                const arr = `${name.toLowerCase()}s`;
                if (!data[arr]) {
                    data[arr] = [];
                }
                fs.readdirSync(path.join(appPath, name)).forEach(f => {
                    if (validateFile(f)) {
                        return;
                    }
                    data[arr].push(getData(path.basename(f, path.extname(f)), path.join(appPath, name, f)));
                });
            } else {
                if (validateFile(file)) {
                    return;
                }
                data[name] = getData(name, fullPath);
            }
        });

        if (!Object.keys(data).length) {
            reject('No json files found.');

            return;
        }

        resolve(data);
    });
};

function validateFile(file) {
    return path.extname(file) !== '.json' && !(path.extname(file) === '.qvs' && path.basename(file, '.qvs').toLowerCase() === 'loadscript');
}

function getData(key, fullPath) {
    console.log(`Reading: ${fullPath}`);

    if (key === 'loadScript') {
        return fs.readFileSync(fullPath, 'utf8');
    }

    return require(fullPath);
}