const
    path = require('path'),
    Promise = require('promise'),
    _ = require('lodash'),
    chalk = require('chalk'),
    serializeApp = require('serializeapp'),
    getSession = require('./getSession.js'),
    writeFiles = require('./writeFiles.js'),
    transformData = require('./transformData.js');

module.exports = settings => {
    return new Promise((resolve, reject) => {
        console.log(chalk.green('Export started for ' + settings.app));

        let globalApi, data;
        const appPath = path.resolve(path.join(settings.path, settings.app));

        const session = getSession(settings);
        session.open()
            .then(x => globalApi = x)
            .then(() => globalApi.getDocList())
            .then(docList => {
                const doc = _.find(docList, x => {
                    if (x.qDocName.toLowerCase().replace('.qvf', '') == settings.app.toLowerCase()) {
                        return true;
                    }
                });

                if (!doc) {
                    throw `App not found: ${settings.app}`;
                }

                return doc.qDocId;
            })
            .then(qDocId => globalApi.openDoc(qDocId))
            .then(app => serializeApp(app))
            .then(data => {
                if (data.fields) {
                    delete data.fields;
                }

                if (data.embeddedmedia) {
                    delete data.embeddedmedia;
                }

                _.remove(data['variables'], x => x.qIsScriptCreated === true);
                _.remove(data['variables'], x => x.qIsReserved);
                _.remove(data['variables'], x => x.qIsConfig);

                // Break sheets into individual first-level objects
                if (data.sheets) {
                    data.sheets.forEach(sheet => {
                        var sheetTitle = sheet.qProperty.qMetaDef.title.replace(/[\\/:"*?<>|]/g, "_");
                        data[`Sheet_${sheet.qProperty.qInfo.qId} (${sheetTitle})`] = sheet;
                    });
                    delete data.sheets;
                }

                if (data.dimensions) {
                    data.dimensions.forEach(dimension => {
                        data[`Dimension_${dimension.qInfo.qId} (${dimension.qMetaDef.title})`] = dimension;
                    });
                    delete data.dimensions;
                }

                if (data.measures) {
                    data.measures.forEach(measure => {
                        data[`Measure_${measure.qInfo.qId} (${measure.qMetaDef.title})`] = measure;
                    });
                    delete data.measures;
                }

                data['variables'] = _.orderBy(data['variables'], x => x.qName);
                data['dataconnections'] = _.orderBy(data['dataconnections'], x => x.qName);
                data['snapshots'] = _.orderBy(data['snapshots'], x => x.qInfo.qId);

                return data;
            })
            .then(x => data = x)
            .then(() => transformData(settings, data))
            .then(() => writeFiles(data, appPath))
            .then(() => session.close())
            .then(() => console.log(chalk.green('Export completed for '  + settings.app)))            
            .then(resolve)
            .catch(error => {
                console.error(chalk.red('Error code %d: %s'), error.code, error.parameter);
                session.close();
               resolve();
            });
    });
};

