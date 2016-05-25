'use strict';

const Git = require('./git');
const SSH = require('./ssh');

module.exports = class Project {
    constructor(configuration, provider, payload){
        this.id             = payload.id;
        this.provider       = provider;
        this.configuration  = (
            configuration[provider] &&
            configuration[provider][this.id]
        ) || {};

        this.ssh = new SSH(this);
        this.git = new Git(this, payload.ssh_url, payload.commit);
    }

};
