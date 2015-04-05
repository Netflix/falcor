var invalidateInitialArgs = require('./invalidateInitialArgs');
var request = require('./../request');
var invalidate = request(
    invalidateInitialArgs,
    null);

module.exports = invalidate;
