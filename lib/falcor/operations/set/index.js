var setInitialArgs = require('./setInitialArgs');
var setSourceRequest = require('./setSourceRequest');
var request = require('./../request');
var set = request(
    setInitialArgs,
    setSourceRequest);

module.exports = set;
