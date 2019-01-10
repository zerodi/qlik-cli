const
    fs = require('fs-extra'),
    path = require('path'),
    Promise = require('promise'),
    beautify = require('js-beautify'),
    sanitize = require("sanitize-filename");

module.exports = (data, appPath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(appPath)) {
            fs.mkdirpSync(appPath);
        }

        if (!fs.existsSync(path.join(appPath, 'Sheet'))) {
            fs.mkdirSync(path.join(appPath, 'Sheet'));
        }
        if (!fs.existsSync(path.join(appPath, 'Dimension'))) {
            fs.mkdirSync(path.join(appPath, 'Dimension'));
        }
        if (!fs.existsSync(path.join(appPath, 'Measure'))) {
            fs.mkdirSync(path.join(appPath, 'Measure'));
        }

        Object.keys(data)
            .forEach(key => {
                const item = data[key],
                    content = getContent(key, item),
                    extension = getExtension(key);
                let filePath;
                if (key.includes('_')) {
                    filePath = path.resolve(path.join(appPath, key.split('_')[0], `${sanitize(key)}.${extension}`));
                } else {
                    filePath = path.resolve(path.join(appPath, `${sanitize(key)}.${extension}`));
                }

                console.log(`Writing: ${filePath}`);
                fs.writeFileSync(filePath, content);
            });

        resolve();
    });
};

function getExtension(key) {
    if (key === 'loadScript') {
        return 'qvs';
    }

    return 'json';
}

function getContent(key, item) {
    if (key === 'loadScript') {
        return item;
    }

    return beautify(JSON.stringify(item));
}