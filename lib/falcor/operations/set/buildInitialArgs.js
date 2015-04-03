var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');
module.exports = function buildInitialArgs(model, args, seeds, format, selector, onNext) {
    return function(seedRequired) {
        var shouldRequest = !!model._dataSource;
        var firstFormat = shouldRequest && 'AsJSONG' || format;
        var operations = combineOperations(args, firstFormat, 'set', shouldRequest && selector);
        var firstSeeds = seeds;
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
            setSeedsOrOnNext(operations, seedRequired, firstSeeds, false, selector);
        } else {
            operations = combineOperations(args, format, 'set');
            setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);
            firstSeeds = seeds;
        }

        return [operations, firstSeeds, shouldRequest];
    };
};
