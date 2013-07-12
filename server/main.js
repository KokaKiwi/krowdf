#!/usr/bin/env node
var http = require('http'),
    path = require('path');

var express = require('express'),
    debug = require('debug'),
    nconf = require('nconf'),
    orm = require('orm'),
    _ = require('underscore'),
    sio = require('socket.io');

var app = express();

var models = require('./models'),
    routes = require('./routes'),
    api = require('./api');

// Init settings
nconf.argv().env().file({
    file: 'local.json'
});

// Init database models
var databaseURL = _.template(nconf.get('database:url'), {
    here: __dirname
});
debug('db')('Database URL: %s', databaseURL);

app.use(orm.express(databaseURL, {
    define: function(db, _models) {
        models.define(db);
        db.sync(function(err) {
            debug('db')(err);
        });
    }
}));

// Server main
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.favicon());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'static')));

// Express server run
var port = nconf.get('server:port');

var server = http.createServer(app).listen(port, function() {
    console.log('Server listening on port ' + port);
});

// Socket.io server run
io = sio.listen(server);

// Express server routes
routes.configure(app);

// Socket.io server methods
io.on('connection', function(socket) {
    api.configure(socket);
});
