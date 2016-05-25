'use strict';

const Project = require('../project');

module.exports = function (req, res) {
    let project = new Project(req.configuration, req.provider, req.body);

    (project
        .git.open()
        .then(() => project.git.connect())
        .then(() => res.status(200).end(), error => {
            console.error(error.stack);
            res.status(500).json(error);
            throw error;
        })
        .then(() => project.git.fetch())
        .then(() => project.git.checkout())
    );
};
