'use strict';

var Git = require('nodegit');

module.exports = function(url, path, branch, deployPath){
    console.log(url, path, branch, deployPath);

    var options = {
        fetchOpts: {
            callbacks: {
                credentials: (url, userName) => {
                    return Git.Cred.sshKeyNew(
                        userName,
                        '/home/git/.ssh/id_rsa.pub',
                        '/home/git/.ssh/id_rsa',
                        ''
                    );
                }
            }
        }
    };

    return Git.Clone(url, path, options).then((repository) => {
        repository.setWorkdir(deployPath, 1);
        return repository.checkoutBranch(branch);
    });
};
