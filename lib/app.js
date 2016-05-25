'use strict';

module.exports = function () {
    const Express = require('express');

    return [
        require('./middleware/_'),
        require('./middleware/configuration'),
        require('./middleware/gitlab'),
        require('./middleware/github')
    ].reduce((n, t) => n.then(t), Promise.resolve(new Express())).then(app => {
        app.set('host', process.env.HOSTNAME || process.env.IP || '0.0.0.0');
        app.set('port', process.env.PORT || 3389);
        app.get('/project/:provider/:id', require('./routes/project'));
        app.post('/webhook', require('./routes/webhook'));
        return app;
    });
};
