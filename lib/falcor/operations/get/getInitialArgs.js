var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');
module.exports = function getInitialArgs(options, seeds, onNext) {
    var seedRequired = options.format !== 'AsValues';
    var operations =
        combineOperations(options.operationArgs, options.format, 'get');
    setSeedsOrOnNext(
        operations, seedRequired, seeds, onNext, options.operationSelector);

    return [operations, seeds, !!options.operationModel._dataSource];
};
