var getInitialArgs = require('./getInitialArgs');
var getSourceRequest = require('./getSourceRequest');
var shouldRequest = require('./shouldRequest');
var request = require('./../request');
var processOperations = require('./../support/processOperations');
var get = request(
    getInitialArgs,
    getSourceRequest,
    processOperations,
    shouldRequest);

module.exports = get;
