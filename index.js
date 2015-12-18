'use strict';

var Express = require('express')
,   app     = Express()
,   body    = require('body-parser')
,   http    = require('http')
,   clone   = require('./clone');

app.use(body.urlencoded({ extended: true }));
app.use(body.json());

var config = require('./config');

app.post('/hook', (req, res) => {
    var repositoryConfiguration = config[req.body.repository.id];

    clone(
        req.body.repository.ssh_url,
        req.headers['x-github-delivery'], 
        repositoryConfiguration.branch,
        repositoryConfiguration.deployPath
    ).then(() => {
        console.log('Repository cloned');
        res.status(200).end();
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });

});

var server = http.createServer(app);

server.listen(3389, '0.0.0.0', (err) => {
    if(err) throw err;
    console.log('Running');
});
