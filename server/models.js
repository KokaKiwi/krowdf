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

models.define = function(db) {

    // Baker
    var Baker = models.Baker = db.define('baker', {
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
    });

    Baker.createNew = function(properties) {
        _.defaults(properties, {
            secret: random_str(32)
        });

        return new Baker(properties);
    };
};
