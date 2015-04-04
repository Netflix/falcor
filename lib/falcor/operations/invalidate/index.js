var invalidateInitialArgs = require('./invalidateInitialArgs');
var noOp = function() {};
var invalidateSourceRequest = function() { return noOp; };
var request = require('./../request');
var invalidate = request(
    invalidateInitialArgs,
    invalidateSourceRequest);

module.exports = invalidate;
