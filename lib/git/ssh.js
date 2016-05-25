'use strict';

const Q     = require('q');
const fs    = require('fs');
const path  = require('path');
const dir   = require('mkdir-recursive');

let stat    = Q.denodeify(fs.stat)
,   read    = Q.denodeify(fs.readFile)
,   mkdir   = Q.denodeify(dir.mkdir);

const SSH   = require('ssh-keygen');

let keygen  = Q.denodeify(SSH);

module.exports = class WebHookSSH {
    constructor(provider, id, git) {
        this.path   = path.join(process.cwd(), './ssh', provider, id);
        this.files  = {
            private: path.join(this.path, 'id_rsa'),
            public:  path.join(this.path, 'id_rsa.pub')
        };
        this.git    = git;

        this._getKeys();
    }

    privateKey() {
        return this.keys.private;
    }

    publicKey() {
        return this.keys.public;
    }

    credential(username) {
        return this.git.Cred.sshKeyMemoryNew(username,
            this.keys.public, this.keys.private
        );
    }

    _getKeys(){
        this.keys = {};
        return stat(this.path).then(
            () => (), () => mkdir(this.path)
        ).then(() => {
            return stat(this.files.private).then(
                () => read(this.files.private).then(key => {
                    this.keys.private = key;
                }).then(() => read(this.files.public)).then(key => {
                    this.keys.public = key;
                }),
                () => keygen({ location: this.files.private }).then(out => {
                    this.keys.private = out.key;
                    this.keys.public = out.pubKey;
                })
            );
        });
    }

};
