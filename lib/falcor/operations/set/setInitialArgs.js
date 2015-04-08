var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');
module.exports = function setInitialArgs(options, seeds, onNext) {
    var seedRequired = options.format !== 'AsValues';
    var shouldRequest = !!options.operationModel._dataSource;
    var format = options.format;
    var args = options.operationArgs;
    var selector = options.operationSelector;
    var firstFormat = shouldRequest && 'AsJSONG' || format;
    var isProgressive = options.operationIsProgressive;
    var operations = combineOperations(
            args, firstFormat, 'set', shouldRequest && selector);
    var firstSeeds;

    if (shouldRequest && selector) {

        // Share the same jsong env in the jsong but not in the paths.
        // This will be required for selector functions
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

    } else if (shouldRequest) {
        firstSeeds = [{}];
        setSeedsOrOnNext(operations, seedRequired, firstSeeds, false, options.selector);
    } else {
        firstSeeds = seeds;
        operations = combineOperations(args, format, 'set');
        setSeedsOrOnNext(operations, seedRequired, seeds, onNext, options.selector);
    }

    return [operations, firstSeeds, shouldRequest, {removeBoundPath: shouldRequest}];
};
