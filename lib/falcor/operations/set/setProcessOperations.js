var processOperations = require('./../support/processOperations');
var combineOperations = require('./../support/combineOperations');
var mergeBoundPath = require('./../support/mergeBoundPath');
var Formats = require('./../support/Formats');
var toPathValues = Formats.toPathValues;

module.exports = setProcessOperations;

function setProcessOperations(model, operations, errorSelector, requestOptions) {

    var boundPath = model._path;
    var hasBoundPath = boundPath.length > 0;
    var removeBoundPath = requestOptions && requestOptions.removeBoundPath;
    var performProgressiveOps =
        requestOptions && requestOptions.performProgressiveOps;

    if (removeBoundPath && hasBoundPath) {
        model._path = [];

        // For every operations arguments, the bound path must be adjusted.
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

    // A second initial operation is required when performing progressive
    // operations.  We will use the output seeds and original args to
    // build a second set of operations.  toPathValues will cancel
    // progessively mode.
    if (performProgressiveOps &&
            operations[0].firstOp.isProgressive &&
            requestOptions.format !== toPathValues) {

        operations = combineOperations(
            requestOptions.operationArgs, requestOptions.format, 'get');
        setSeedsOrOnNext(
            operations, true, seeds, onNext, requestOptions.selector);
        processOperations(model, operations, errorSelector);
    }

    return results;
}
