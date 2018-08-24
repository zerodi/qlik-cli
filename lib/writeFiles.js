const
    fs = require('fs'),
    path = require('path'),
    Promise = require('promise'),
    beautify = require('js-beautify');

module.exports = (data, appPath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(appPath)) {
            fs.mkdirSync(appPath);
        }

        Object.keys(data)
            .forEach(key => {
                const item = data[key],
                    content = getContent(key, item),
                    extension = getExtension(key),
                    filePath = path.resolve(path.join(appPath, `${key}.${extension}`));

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