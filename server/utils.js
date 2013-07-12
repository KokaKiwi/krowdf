var qs = require('querystring');

var nconf = require('nconf');

var utils = module.exports = {};

var route_url = utils.route_url = function(path, params) {
    var url = nconf.get('server:root_url');
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
    if (qparams && qparams.length > 0) {
        url += '?' + qs.stringify(qparams);
    }

    return url;
};
