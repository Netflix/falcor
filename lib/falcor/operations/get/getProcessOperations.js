var processOperations = require('./../support/processOperations');
var mergeBoundPath = require('./../support/mergeBoundPath');
var Formats = require('./../support/Formats');
var onNextValues = require('./../support/onNextValue');
var toPathValues = Formats.toPathValues;

module.exports = getProcessOperations;

/**
 * Processes the operations coming into the recurse request async pipeline.
 */
function getProcessOperations(model, operations, errorSelector, options) {

    var boundPath = model._path;
    var hasBoundPath = boundPath.length > 0;
    var removeBoundPath = options && options.removeBoundPath;

    // even though we do gets, if we get and something is missing
    // we could still potentially perform a set, and be bound.
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

    // If the first operation is progressive and we are not in pathValues mode
    // then emit values to the user.
    var firstOp = operations[0];
    if (firstOp && firstOp.isProgressive && firstOp.format !== toPathValues) {
        onNextValues(model, options.onNext, options.seeds, options.selector);
    }

    // Undo what we have done to the model's bound path.
    if (removeBoundPath && hasBoundPath) {
        model._path = boundPath;
    }

    return results;
}
