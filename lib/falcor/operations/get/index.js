var getInitialArgs = require('./getInitialArgs');
var getSourceRequest = require('./getSourceRequest');
var shouldRequest = require('./shouldRequest');
var request = require('./../request');
var getProcessOperations = require('./getProcessOperations');
var get = request(
    getInitialArgs,
    getSourceRequest,
    getProcessOperations,
    shouldRequest);

module.exports = get;
