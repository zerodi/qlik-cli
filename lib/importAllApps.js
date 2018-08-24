const
    fs = require('fs'),
    path = require('path'),
    Promise = require('promise'),
    _ = require('lodash'),
    chalk = require('chalk'),
    importApp = require('./importApp.js');

module.exports = settings => {
    return new Promise((resolve, reject) => {
        console.log(chalk.green('Import all apps started.'));

        const promiseFactories = [];

        fs.readdirSync(settings.path)
            .forEach(item => {
                const appPath = path.join(settings.path, item);

                if (!fs.statSync(appPath).isDirectory()) {
                    return;
                }

                const appSettings = _.assign({}, settings);

                appSettings.app = item;

                promiseFactories.push(() => importApp(appSettings));
            });

        if (!promiseFactories || !promiseFactories.length) {
            resolve();

            return;
        }

        executeSequentially(promiseFactories).then(resolve).catch(reject);
    });
};

function executeSequentially(promiseFactories) {
    let result = Promise.resolve();

    promiseFactories.forEach(function(promiseFactory) {
        result = result.then(promiseFactory);
    });

    return result;
}