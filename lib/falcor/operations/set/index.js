var setInitialArgs = require('./setInitialArgs');
var setSourceRequest = require('./setSourceRequest');
var request = require('./../request');
var setProcessOperations = require('./setProcessOperations');
var shouldRequest = require('./shouldRequest');
var finalize = require('./finalizeAndCollect');
var set = request(
    setInitialArgs,
    setSourceRequest,
    setProcessOperations,
    shouldRequest,
    finalize
);

module.exports = set;
