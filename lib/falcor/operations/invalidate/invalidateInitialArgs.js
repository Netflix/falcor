var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');
module.exports = function invalidateInitialArgs(model, args, seeds, format, selector, onNext) {
    return function(seedRequired) {
        var operations = combineOperations(args, format, 'inv');
        setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);

        return [operations, seeds, false];
    };
};
