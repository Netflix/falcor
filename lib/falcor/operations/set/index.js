var setInitialArgs = require('./setInitialArgs');
var setSourceRequest = require('./setSourceRequest');
var request = require('./../request');
var setProcessOperations = require('./setProcessOperations');
var shouldRequest = require('./shouldRequest');
var set = request(
    setInitialArgs,
    setSourceRequest,
    setProcessOperations,
    shouldRequest);

module.exports = set;
