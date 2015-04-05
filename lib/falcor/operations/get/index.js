var getInitialArgs = require('./getInitialArgs');
var getSourceRequest = require('./modelSourceRequest');
var shouldRequest = require('./shouldRequest');
var request = require('./../request');
var get = request(
    getInitialArgs,
    getSourceRequest,
    shouldRequest);

module.exports = get;
