'use strict';

const Project = require('../project');

module.exports = function (req, res) {
    let project = new Project(req.configuration, req.params.provider, {
        id: req.params.id
    });

    project.ssh.getKeys().then(keys => {
        res.status(200).json({
            provider: req.params.provider,
            id: req.params.id,
            ssh: keys.public
        });
    });
};
