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

    if (secret) {
        var Baker = models.Baker;
        Baker.find({secret: secret}, function(err, bakers) {
            if (err) {
                debug('db')(err);
            }

            var baker = _.first(bakers);
            if (baker) {
                ipn.verify(req.body, function(err, msg) {
                    if (err) {
                        debug('paypal')(err);
                        res.send(500, 'Error.');
                    } else {
                        if (req.param('payment_status') == 'Completed') {
                            baker.payment = req.body;
                            baker.validated = true;
                            baker.amount = parseFloat(req.param('mc_gross'));
                            baker.save(function(err) {
                                if (err) {
                                    debug('db')(err);
                                    res.send(500, 'Error.');
                                } else {
                                    console.log('Baker ' + baker.name + ' validated.');
                                    res.send('Done.');
                                }
                            })
                        }
                    }
                });
            } else {
                res.send(404, 'No baker for secret: ' + secret);
            }
        });
    } else {
        res.send(500, 'Error.');
    }
};

routes.configure = function(app) {
    app.get('/', routes.index);
    app.get('/validate/:secret', routes.validate);
    app.post('/paypal_ipn', routes.paypal_ipn);
};
