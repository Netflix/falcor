var setInitialArgs = require('./setInitialArgs');
var setSourceRequest = require('./modelSourceRequest');
var request = require('./../request');
var set = request(
    setInitialArgs,
    setSourceRequest);

module.exports = set;
