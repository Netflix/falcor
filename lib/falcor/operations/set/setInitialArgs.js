var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');
var Formats = require('./../support/Formats');
var toPathValues = Formats.toPathValues;
var toJSONG = Formats.toJSONG;
module.exports = function setInitialArgs(options, seeds, onNext) {
    var seedRequired = options.format !== toPathValues;
    var shouldRequest = !!options.operationModel._dataSource;
    var format = options.format;
    var args = options.operationArgs;
    var selector = options.operationSelector;
    var isProgressive = options.operationIsProgressive;
    var firstSeeds;

    // if should request the operations need to be created with toJSONG as
    // the format.
    if (shouldRequest) {
        operations =
            combineOperations(args, toJSONG, 'set', selector, isProgressive);
    }

    // Set initialArgs is odd.  If set needs to request data, it must create
    // dummy seeds.  These seeds will be used to fill in JSONG that will be
    // sent to the server.
    if (shouldRequest && selector) {

        // Selector function have multiple seeds.  The jsong is shared so that
        // the request function can accumulate the requested paths.
        var jsong = {};
        firstSeeds = [];
        operations.forEach(function(op) {
            var seed = {
                jsong: jsong,
                paths: []
            };
            op.seeds = [seed];
            firstSeeds.push(seed);
        });

    }

    // If in shouldRequest mode, a single seed is required to accumulate the
    // jsong results.
    else if (shouldRequest) {
        firstSeeds = [{}];
        setSeedsOrOnNext(
            operations, seedRequired, firstSeeds, false, options.selector);
    }

    // This model is the master, therefore a regular set can be performed.
    else {
        firstSeeds = seeds;
        operations = combineOperations(args, format, 'set');
        setSeedsOrOnNext(
            operations, seedRequired, seeds, onNext, options.selector);
    }

    var requestOptions = {
        removeBoundPath: shouldRequest
    };
    if (isProgressive) {
        requestOptions.seeds = seeds;
        requestOptions.args = args;
        requestOptions.onNext = onNext;
        requestOptions.format = format;
        requestOptions.selector = options.selector;
    }
    return [operations, firstSeeds, shouldRequest, requestOptions];
};
