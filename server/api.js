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
        bakers: []
    };

    var Baker = models.Baker;
    Baker.find({validated: 1}, function(err, bakers) {
        if (err) {
            debug('db')(err);
            data.err = err;
        } else {
            _.each(bakers, function(baker) {
                data.bakers.push(_.pick(baker, nconf.get('settings:bakers_public_fields')));

                data.goal.current += baker.amount;
            });
        }

        cb(data);
    });
};

var pledge = api.pledge = function(infos, cb) {
    var Baker = models.Baker;
    var baker = Baker.createNew(infos);

    baker.save(function(err) {
        if (err) {
            debug('db')(err);
            cb(null);
        } else {
            var result = {
                url: paypal.makeUrl(baker),
                secret: baker.secret
            };

            cb(result);
        }
    });
};

api.configure = function(socket) {
    socket.on('getData', getData);
    socket.on('pledge', pledge);
};
