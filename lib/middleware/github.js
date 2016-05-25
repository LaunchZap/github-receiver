'use strict';

module.exports = function (app) {
    let apply = req => {
        req.provider = 'github';
        req.body = {
            id: req.body.repository.id,
            commit: req.body.commits[0].id,
            ssh_url: req.body.repository.ssh_url,
        };
    };

    app.use('/webhook', (req, res, next) => {
        if(req.headers['x-github-delivery']) {
            apply(req);
        }
        next();
    });

    return app;
};
