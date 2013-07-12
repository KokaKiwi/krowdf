var _ = require('underscore');

var models = require('./models');

var routes = module.exports = {};

routes.index = function(req, res) {
    res.sendfile('public/index.html');
};

routes.validate = function(req, res) {
    var secret = req.params.secret;

    var Baker = models.Baker;
    Baker.find({secret: secret}, function(err, bakers) {
        if (err) {
            console.log(err);
        }

        _.each(bakers, function(baker) {
            baker.amount = 10;
            baker.validated = true;
            baker.save(function(err) {
                if (err) {
                    console.log(err);
                }
            });
        });

        res.send('Done.');
    });
}

routes.configure = function(app) {
    app.get('/', routes.index);
    app.get('/validate/:secret', routes.validate);
};
