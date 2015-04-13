var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');

/**
 * The initial args that are passed into the async request pipeline.
 * @see lib/falcor/operations/request.js for how initialArgs are used
 */
module.exports = function getInitialArgs(options, seeds, onNext) {
    var seedRequired = options.format !== 'AsValues';
    var isProgressive = options.operationIsProgressive;
    var spreadOperations = false;
    debugger
    var operations =
        combineOperations(
            options.operationArgs, options.format, 'get',
            spreadOperations, isProgressive);
    setSeedsOrOnNext(
        operations, seedRequired, seeds, onNext, options.operationSelector);
    var requestOptions;
    return [operations];
};
