'use strict';

const SSH = require('../git/ssh');

module.exports = function (req, res) {
    let ssh = new SSH(req.params.provider, req.params.id);

    res.status(200).json({
        provider: req.params.provider,
        id: req.params.id,
        ssh: ssh.publicKey()
    });
};
