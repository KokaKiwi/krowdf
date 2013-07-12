var qs = require('querystring');

var nconf = require('nconf'),
    _ = require('underscore');

var utils = module.exports = {};

var route_url = utils.route_url = function(path, params, options) {
    options = options || {};
    _.defaults(options, {
        root_url: nconf.get('server:root_url')
    });

    var url = options.root_url;
    if (path) {
        url += path;
    }

    var qparams = {};
    for (var key in params) {
        if (url.indexOf(':' + key) != -1) {
            url = url.replace(':' + key, params[key]);
        } else {
            qparams[key] = params[key];
        }
    }
    if (!_.isEmpty(qparams)) {
        url += '?' + qs.stringify(qparams);
    }

    return url;
};
