var ModelResponse = require('../ModelResponse');
var get = require('./get');

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
        }
        return ModelResponse.create(modelResponder);
    };
};
