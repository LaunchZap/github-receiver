'use strict';

const http  = require('http');
const url   = require('url');
const Q     = require('q');

let application = require('./app')
,   server, hostname, port;

application().then(app => {
    server      = http.createServer(app);
    let listen  = Q.nbind(server.listen, server);

    port        = app.get('port');
    hostname    = app.get('host');
    return listen(port, hostname).then(() => console.log(
        'Receiver running over %s', url.format({
            protocol: 'http',
            hostname: app.get('host'),
            port: app.get('port')
        })
    ));
}).catch(error => console.error(error));
