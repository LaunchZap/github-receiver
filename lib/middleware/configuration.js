'use strict';

module.exports = function (app) {
    const Q = require('q');
    const fs = require('fs');
    const path = require('path');

    let stat    = Q.denodeify(fs.stat)
    ,   readdir = Q.denodeify(fs.readdir);

    let PATH = './configuration';
    return stat(PATH).then(
        stats => stats.isDirectory() ? readdir(PATH) : [], () => []
    ).then(files => {
        return (files
            .filter(file => path.extname(file) === '.json')
            .reduce((_files, file) => {
                let name = path.basename(file, '.json');
                _files[name] = require(path.join(process.cwd(), PATH, file));
                return _files;
            }, {})
        );
    }).then(configuration => {
        app.use((req, res, next) => {
            req.configuration = configuration;
            next();
        });
        return app;
    });
};
