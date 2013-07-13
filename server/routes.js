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

    var Backer = models.Backer;
    Backer.find({secret: secret}, function(err, backers) {
        if (err) {
            debug('db')(err);
        }

        var backer = _.first(backers);
        if (backer) {
            backer.amount = backer.amount == 0 ? 10 : backer.amount;
            backer.validated = true;
            backer.payment = req.params;

            backer.save(function(err) {
                if (err) {
                    console.log(err);
                }

                res.send('Done.');
            });
        } else {
            res.send('No backer with secret: ' + secret);
        }
    });
};

routes.paypal_ipn = function(req, res) {
    var secret = req.param('secret');

    if (secret) {
        var Backer = models.Backer;
        Backer.find({secret: secret}, function(err, backers) {
            if (err) {
                debug('db')(err);
            }

            var backer = _.first(backers);
            if (backer) {
                ipn.verify(req.body, function(err, msg) {
                    if (err) {
                        debug('paypal')(err);
                        res.send(500, 'Error.');
                    } else {
                        if (req.param('payment_status') == 'Completed') {
                            backer.payment = req.body;
                            backer.validated = true;
                            backer.amount = parseFloat(req.param('mc_gross'));
                            backer.save(function(err) {
                                if (err) {
                                    debug('db')(err);
                                    res.send(500, 'Error.');
                                } else {
                                    console.log('Backer ' + backer.name + ' validated.');
                                    res.send('Done.');
                                }
                            })
                        }
                    }
                });
            } else {
                res.send(404, 'No backer for secret: ' + secret);
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
