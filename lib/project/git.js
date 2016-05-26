'use strict';

const Q     = require('q');
const fs    = require('fs');
const path  = require('path');
const Git   = require('nodegit');
const dir   = require('mkdir-recursive');

let stat    = Q.denodeify(fs.stat)
,   mkdir   = Q.denodeify(dir.mkdir);

module.exports = class WebHookGit {
    constructor(project, _ref, _url, _commit){
        this.dataPath   = path.join(process.cwd(), './data', project.provider);
        this._repoPath  = path.join(
            this.dataPath, `${project.id.toString()}.git`
        );
        this._ref       = _ref;
        this._url       = _url;
        this._commit    = _commit;
        this._ssh       = project.ssh;
        this.workdir    = (project.configuration &&
            project.configuration.workdir
        ) || '';
    }

    create() {
        let path = this.dataPath;
        return stat(path).then(
            () => {}, () => mkdir(path)
        ).then(() => Git.Repository.init(this._repoPath, 1));
    }

    open() {
        return stat(this._repoPath).then(
            () => Git.Repository.openBare(this._repoPath), () => this.create()
        ).then(repository => {
            this.repository = repository;
        });
    }

    getRemote() {
        return Git.Remote.list(this.repository).then(list => {
            if(!list.some(remote => remote === 'origin')) {
                return Git.Remote.create(this.repository, 'origin', this._url);
            }
            return Git.Remote.lookup(this.repository, 'origin').then(origin => {
                if(origin.url !== this._url) {
                    Git.Remote.setUrl(this.repository, 'origin', this._url);
                    return Git.Remote.lookup(this.repository, 'origin');
                }
                return origin;
            });
        });
    }

    connect() {
        return this.getRemote().then(
            origin => Q.all([ origin, this._ssh.getKeys() ])
        ).then(objects => {
            let origin  = objects[0]
            ,   keys    = objects[1];

            return origin.connect(0, { credentials: (url, userName) => {
                return Git.Cred.sshKeyNew(
                    userName, keys.files.public, keys.files.private, ''
                );
            }}).then(error => {
                if(error) throw error;
                if(!origin.connected()) throw new Error('Connection error');
                return origin.disconnect();
            });
        });
    }

    createMasterBranch() {
        const masterRefName = 'master';
        const remoteMasterRefName = 'refs/remotes/origin/master';
        return this.repository.getBranch(masterRefName).then(
            () => {}, () => Git.Reference.symbolicCreate(this.repository,
                'refs/remotes/origin/HEAD', remoteMasterRefName,
                1, 'Set origin head'
            ).then(
                () => this.repository.getReference(remoteMasterRefName)
            ).then(remoteMasterRef => {
                const commitOid = remoteMasterRef.target();
                return this.repository.createBranch('master', commitOid).then(
                    masterRef => this.repository.checkoutBranch(masterRef)
                );
            })
        );
    }

    pull() {
        return Q.spread([
            this.getRemote(), this._ssh.getKeys()
        ], (origin, keys) => {
            return origin.fetch([ this._ref ], { callbacks: {
                credentials: (url, userName) => {
                    return Git.Cred.sshKeyNew(
                        userName, keys.files.public, keys.files.private, ''
                    );
                }
            }});
        }).then(() => {
            return this.createMasterBranch().then(
                () => this.repository.mergeBranches(
                    'master', 'origin/master', null,
                    Git.Merge.PREFERENCE.FASTFORWARD_ONLY
                )
            ).then(() => console.log('Merged!'));
        }).catch(error => console.error(error.stack));
    }

    checkout() {
        let workdir = (
            !path.isAbsolute(this.workdir) &&
            path.join(process.cwd(), this.workdir)
        ) || this.workdir;
        this.repository.setWorkdir(workdir, 1);
        console.log('Checking out');
        return this.repository.checkoutRef(this._ref, {
            targetDirectory: workdir
        }).then(
            () => console.log('Checked out'),
            err => console.error(err.stack)
        ).catch(err => console.error(err));
    }
};
