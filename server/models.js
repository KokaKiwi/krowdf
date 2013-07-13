var _ = require('underscore');

var models = module.exports = {};

var RAND_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

var random_str = models.random_str = function (length) {
    length = length ? length : 5;
    var str = '';

    for (var i = 0; i < length; i++) {
        str += RAND_ALPHABET.charAt(Math.floor(Math.random() * RAND_ALPHABET.length));
    }

    return str;
}

var default_str = models.default_str = function(obj, key) {
    var str = obj[key];
    if (!str || str.length == 0) {
        delete obj[key];
    }
};

models.define = function(db) {

    // Backer
    var Backer = models.Backer = db.define('Backer', {
        name: {
            required: false,
            type: 'text',
            size: 32,
            defaultValue: 'Anonymous'
        },
        email: {
            required: false,
            type: 'text',
            defaultValue: 'anonymous@mailinator.com'
        },
        secret: {
            required: true,
            type: 'text',
            size: 32
        },
        validated: {
            required: true,
            type: 'boolean',
            defaultValue: false
        },
        amount: {
            required: true,
            type: 'number',
            defaultValue: 0
        },
        payment: {
            required: false,
            type: 'object'
        }
    }, {
        validate: function(amount) {
            this.amount = amount;
            this.validated = true;
        }
    });

    Backer.createNew = function(properties) {
        _.defaults(properties, {
            secret: random_str(32)
        });
        default_str(properties, 'name');
        default_str(properties, 'email');

        return new Backer(properties);
    };
};
