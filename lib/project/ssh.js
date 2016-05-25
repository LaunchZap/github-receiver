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
    constructor(project) {
        this.project = project;
    }

    getKeys(){
        let _path = path.join(
            process.cwd(), './ssh', this.project.provider,
            this.project.id.toString()
        )
        ,   files = {
            private: path.join(_path, 'id_rsa'),
            public:  path.join(_path, 'id_rsa.pub')
        }
        ,   keys  = {};
        return stat(_path).then(() => {}, () => mkdir(_path)).then(() => {
            return stat(files.private).then(
                () => read(files.private).then(key => {
                    keys.private = key.toString();
                }).then(() => read(files.public)).then(key => {
                    keys.public = key.toString();
                }),
                () => keygen({
                    location: files.private,
                    destroy: false
                }).then(out => {
                    keys.private = out.key;
                    keys.public = out.pubKey;
                })
            );
        }).then(() => ({
            public: keys.public.substring(0, keys.public.lastIndexOf(" \n")),
            private: keys.private.substring(0, keys.private.lastIndexOf(" \n")),
            files: files
        }));
    }

};
