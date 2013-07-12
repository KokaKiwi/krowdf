var _ = require('underscore'),
    ipn = require('paypal-ipn'),
    debug = require('debug');

var models = require('./models');

var routes = module.exports = {};

routes.index = function(req, res) {
    res.sendfile('public/index.html');
};

routes.validate = function(req, res) {
    var secret = req.param('secret');

    var Baker = models.Baker;
    Baker.find({secret: secret}, function(err, bakers) {
        if (err) {
            debug('db')(err);
        }

        var baker = _.first(bakers);
        if (baker) {
            baker.amount = baker.amount == 0 ? 10 : baker.amount;
            baker.validated = true;
            baker.payment = req.params;

            baker.save(function(err) {
                if (err) {
                    console.log(err);
                }

                res.send('Done.');
            });
        } else {
            res.send('No baker with secret: ' + secret);
        }
    });
};

routes.paypal_ipn = function(req, res) {
    var secret = req.param('secret');

    var Baker = models.Baker;
    Baker.find({secret: secret}, function(bakers) {
        var baker = _.first(bakers);
        if (baker) {
            ipn.verify(req.body, function(err, msg) {
                if (err) {
                    debug('db')(err);
                    res.send('Error.');
                } else {
                    if (req.param('payment_status') == 'Completed') {
                        baker.payment = req.params;
                        baker.validated = true;

                        baker.save(function(err) {
                            if (err) {
                                debug('db')(err);
                            }

                            res.send('Done.');
                        });
                    }
                }
            });
        }
    });
};

routes.configure = function(app) {
    app.get('/', routes.index);
    app.get('/validate/:secret', routes.validate);
    app.get('/paypal_ipn', routes.paypal_ipn);
};
