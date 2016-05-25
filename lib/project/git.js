'use strict';

const Q     = require('q');
const fs    = require('fs');
const path  = require('path');
const Git   = require('nodegit');
const dir   = require('mkdir-recursive');

let stat    = Q.denodeify(fs.stat)
,   mkdir   = Q.denodeify(dir.mkdir);

module.exports = class WebHookGit {
    constructor(project, _url, _commit){
        this.dataPath   = path.join(process.cwd(), './data', project.provider);
        this._data      = path.join(this.dataPath, project.id);
        this._url       = _url;
        this._commit    = _commit;
        this._ssh       = project.ssh;
    }

    create() {
        let path = this.dataPath;
        return stat(path).then(() => {}, () => mkdir(path)).then(() => {
            return Git.Repository.init(this._data, true);
        });
    }

    open() {
        return stat(this._data).then(
            () => Git.Repository.openBare(this._data), this.create
        ).then(repository => {
            this.repository = repository;
        });
    }

    connect() {

    }

    fetch() {

    }

    checkout() {

    }
};
