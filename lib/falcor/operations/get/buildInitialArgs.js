var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');
module.exports = function buildInitialArgs(model, args, seeds, format, selector, onNext) {
    return function(seedRequired) {
        var operations = combineOperations(args, format, 'get');
        setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);

        return [operations, seeds, !!model._dataSource];
    };
};
