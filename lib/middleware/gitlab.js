'use strict';

module.exports = function (app) {
    let apply = req => {
        req.provider = 'gitlab';
        req.body = {
            id: req.body.repository.id,
            ssh_url: req.body.repository.ssh_url,
            commit: req.body.after
        };
    };

    app.use('/webhook', (req, res, next) => {
        if(req.headers['x-gitlab-event']) {
            apply(req);
        }
        next();
    });

    return app;
};
