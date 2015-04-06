var setInitialArgs = require('./setInitialArgs');
var setSourceRequest = require('./setSourceRequest');
var request = require('./../request');
var setProcessOperations = require('./setProcessOperations');
var set = request(
    setInitialArgs,
    setSourceRequest,
    setProcessOperations);

module.exports = set;
