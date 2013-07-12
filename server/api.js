var nconf = require('nconf'),
    _ = require('underscore');

var models = require('./models'),
    utils = require('./utils');

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
            console.log(err);
            data.err = err;
        } else {
            _.each(bakers, function(baker) {
                data.bakers.push({
                    name: baker.name,
                    amount: baker.amount
                });

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
            cb(err, null);
        } else {
            var result = {
                validateUrl: utils.route_url('/validate/:secret', {
                    secret: baker.secret
                })
            };

            cb(null, result);
        }
    });
};

api.configure = function(socket) {
    socket.on('getData', getData);
    socket.on('pledge', pledge);
};
