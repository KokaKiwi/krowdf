var qs = require('querystring');

var nconf = require('nconf'),
    _ = require('underscore'),
    debug = require('debug');

var models = require('./models'),
    utils = require('./utils'),
    paypal = require('./paypal');

var api = module.exports = {};

var getData = api.getData = function(cb) {
    var data = {
        goal: {
            current: 0,
            total: nconf.get('settings:amount_needed')
        },
        backers: []
    };

    var Backer = models.Backer;
    Backer.find({validated: 1}, function(err, backers) {
        if (err) {
            debug('db')(err);
            data.err = err;
        } else {
            _.each(backers, function(backer) {
                data.backers.push(_.pick(backer, nconf.get('settings:backers_public_fields')));

                data.goal.current += backer.amount;
            });
        }

        cb(data);
    });
};

var pledge = api.pledge = function(infos, cb) {
    var Backer = models.Backer;
    var backer = Backer.createNew(infos);

    backer.save(function(err) {
        if (err) {
            debug('db')(err);
            cb(null);
        } else {
            var result = {
                url: paypal.makeUrl(backer),
                secret: backer.secret
            };

            cb(result);
        }
    });
};

api.configure = function(socket) {
    socket.on('getData', getData);
    socket.on('pledge', pledge);
};
