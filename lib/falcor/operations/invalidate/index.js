var invalidateInitialArgs = require('./invalidateInitialArgs');
var request = require('./../request');
var processOperations = require('./../support/processOperations');
var invalidate = request(
    invalidateInitialArgs,
    null,
    processOperations);

module.exports = invalidate;
