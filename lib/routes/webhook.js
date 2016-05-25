'use strict';

const Git = require('../git');

module.exports = function (req, res) {
    let configuration   = req.configuration[req.provider]
    ,   git             = new Git(configuration, req.body);

    (git
        .open()
        .then(git.connect)
        .then(() => res.status(200).end(), error => {
            res.status(500).json(error);
            throw error;
        })
        .then(git.fetch)
        .then(git.checkout)
    );
};
