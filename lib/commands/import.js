const
    chalk = require('chalk'),
    importApp = require('../importApp.js');

module.exports.command = 'import <app>';
module.exports.desc = 'Import Qlik App from json files';

module.exports.handler = settings => {
    importApp(settings)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(chalk.red(error.toString()));
            process.exit(1);
        });
};
