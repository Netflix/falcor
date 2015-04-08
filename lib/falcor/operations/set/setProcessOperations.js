var processOperations = require('./../support/processOperations');
var mergeBoundPath = require('./../support/mergeBoundPath');

module.exports = setProcessOperations;

function setProcessOperations(model, operations, errorSelector, options) {

    var boundPath = model._path;
    var hasBoundPath = boundPath.length > 0;
    var removeBoundPath = options.removeBoundPath;

    if (removeBoundPath && hasBoundPath) {
        model._path = [];

        // For every operations arguments, they must be adjusted.
        for (var i = 0, opLen = operations.length; i < opLen; i++) {
            var args = operations[i].args;
            for (var j = 0, argsLen = args.length; j < argsLen; j++) {
                args[i] = mergeBoundPath(args[i], boundPath);
            }
        }
    }

    var results = processOperations(model, operations, errorSelector);

    // Undo what we have done to the model's bound path.
    if (removeBoundPath && hasBoundPath) {
        model._path = boundPath;
    }

    // TODO: this is where i would put setProgressively extra calls.

    return results;
}
