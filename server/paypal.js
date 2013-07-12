var qs = require('querystring');
var nconf = require('nconf'),
    _ = require('underscore');
var utils = require('./utils');

var paypal = module.exports = {};

var makeUrl = paypal.makeUrl = function(baker) {
    var ROOT_URL = nconf.get('settings:paypal:test')
        ? 'https://www.sandbox.paypal.com'
        : 'https://www.paypal.com';

    var notify_url = _.template(nconf.get('settings:paypal:notify_url'), {
        root_url: nconf.get('server:root_url'),
        paypal_url: ROOT_URL
    });
    var return_url = _.template(nconf.get('settings:paypal:return_url'), {
        root_url: nconf.get('server:root_url'),
        paypal_url: ROOT_URL
    });
    var cancel_url = _.template(nconf.get('settings:paypal:cancel_url'), {
        root_url: nconf.get('server:root_url'),
        paypal_url: ROOT_URL
    });

    var url = utils.route_url('/cgi-bin/webscr', {
        cmd: '_donations',
        notify_url: notify_url + '?' + qs.stringify({
            secret: baker.secret
        }),
        item_name: nconf.get('settings:paypal:title'),
        currency_code: nconf.get('settings:paypal:currency'),
        business: nconf.get('settings:paypal:address'),
        no_shipping: 1,
        return: return_url,
        cancel_return: cancel_url
    }, {
        root_url: ROOT_URL
    });

    return url;
};
