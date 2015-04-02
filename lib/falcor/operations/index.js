var ModelResponse = require('../ModelResponse');
var get = require('./get');
var set = require('./set');
var invalidate = require('./invalidate');

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
            modelResponder = set(model, args, selector);
        } else if (name === 'invalidate') {
            modelResponder = invalidate(model, args, selector);
        }
        return ModelResponse.create(modelResponder);
    };
};
