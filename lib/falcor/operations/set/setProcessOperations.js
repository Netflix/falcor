var processOperations = require('./../support/processOperations');
var mergeBoundPath = require('./../support/mergeBoundPath');

module.exports = setProcessOperations;

function setProcessOperations(model, operations, errorSelector, options) {

    debugger
    var boundPath = model._path;
    var hasBoundPath = boundPath.length > 0;
    var setWithBind = options.setWithBind;

    if (!setWithBind && hasBoundPath) {
        model._path = [];

        // For every operations arguments, they must be adjusted.
        // Since this is always AsJSONG, mergeBoundPath works
        for (var i = 0, opLen = operations.length; i < opLen; i++) {
            var args = operations[i].args;
            for (var j = 0, argsLen = args.length; j < argsLen; j++) {
                args[i] = mergeBoundPath(args[i], boundPath);
            }
        }
    }

    var results = processOperations(model, operations, errorSelector);

    // TODO: This is where i would do setProgessively

    // Undo what we have done to the model's bound path.
    if (!setWithBind && hasBoundPath) {
        model._path = boundPath;
    }

    return results;
}
