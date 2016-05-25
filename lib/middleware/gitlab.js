'use strict';

module.exports = function (app) {
    let apply = req => {
        req.provider = 'gitlab';
        req.body = {
            id: req.body.project_id,
            ssh_url: req.body.project.gitssh_url,
            commit: req.body.checkout_sha
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
