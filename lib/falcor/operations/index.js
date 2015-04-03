var ModelResponse = require('../ModelResponse');
var request = require('./request');
var setInitialArgs = require('./set/buildInitialArgs');
var setSourceRequest = require('./set/modelSourceRequest');
var getInitialArgs = require('./get/buildInitialArgs');
var getSourceRequest = require('./get/modelSourceRequest');
var getShouldRequest = require('./get/shouldRequest');
var invalidateInitialArgs = require('./invalidate/invalidateInitialArgs');
var invalidateSourceRequest = require('./invalidate/modelSourceRequest');

module.exports = function modelOperation(name) {
    return function() {
        var model = this, root = model._root,
            args = Array.prototype.slice.call(arguments),
            selector = args[args.length - 1];
        if (typeof selector === 'function') {
            args.pop();
        } else {
            selector = false;
        }

        var modelResponder;
        if (name === 'get') {
            modelResponder = request(
                model,
                args,
                selector,
                getInitialArgs,
                getSourceRequest,
                getShouldRequest);
        } else if (name === 'set') {
            modelResponder = request(
                model,
                args,
                selector,
                setInitialArgs,
                setSourceRequest);
        } else if (name === 'invalidate') {
            modelResponder = request(
                model,
                args,
                selector,
                invalidateInitialArgs,
                invalidateSourceRequest);
        }
        return ModelResponse.create(modelResponder);
    };
};
