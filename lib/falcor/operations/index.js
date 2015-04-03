var ModelResponse = require('../ModelResponse');
var request = require('./request');
var setInitialArgs = require('./set/buildInitialArgs');
var setSourceRequest = require('./set/modelSourceRequest');

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
            modelResponder = get(model, args, selector);
        } else if (name === 'set') {
            modelResponder = request(model, args, selector, setInitialArgs, setSourceRequest);
        } else if (name === 'invalidate') {
            modelResponder = invalidate(model, args, selector);
        }
        return ModelResponse.create(modelResponder);
    };
};
