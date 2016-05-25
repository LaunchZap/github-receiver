'use strict';

const body = require('body-parser');

module.exports = function (app) {
    app.use(body.urlencoded({ extended: true }));
    app.use(body.json());

    return app;
};
