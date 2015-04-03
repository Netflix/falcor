var combineOperations = require('../support/combineOperations');
var partitionOperations = require('../support/partitionOperations');
var getSourceRequest = require('./getSourceRequest');
var processOperations = require('../support/processOperations');
var setSeedsOrOnNext = require('../support/setSeedsOrOnNext');
var onNextValues = require('../support/onNextValue');
var onCompletedOrError = require('../support/onCompletedOrError');
var primeSeeds = require('../support/primeSeeds');

module.exports = function get(model, args, selector) {
    return function(options) {
        var onNext = options.onNext.bind(options),
            onError = options.onError.bind(options),
            onCompleted = options.onCompleted.bind(options),
            errorSelector = model._errorSelector,
            isProgressive = options.isProgressive,
            selectorLength = selector && selector.length || 0;

        // State variables
        var shouldRequest = !!model._dataSource;
        var errors = [];
        var format = selector && 'AsJSON' ||
            options.format || 'AsPathMap';
        var toJSONG = format === 'AsJSONG';
        var toJSON = format === 'AsPathMap';
        var toPathValues = format === 'AsValues';
        var seedRequired = toJSON || toJSONG || selector;
        var i;
        var foundValue = false;
        var seeds;
        if (seedRequired) {
            seeds = primeSeeds(selector, selectorLength);
        }

        function recurse(operations, relativeSeeds) {

            // make the JSON-Graph call
            var combinedResults = processOperations(
                model,
                operations,
                errorSelector);

            var missingPaths = combinedResults.requestedMissingPaths;
            var isMissing = missingPaths.length;
            foundValue = foundValue || combinedResults.valuesReceived;

            // Starts the async request process for the servers
            // data in the case of missing paths.
            if (shouldRequest && isMissing) {
                getSourceRequest(
                    model,
                    missingPaths,
                    combinedResults.optimizedMissingPaths,
                    function onCompleteFromSourceGet(err, results) {
                        shouldRequest = false;
                        if (err) {
                            errors = errors.concat(err);
                            recurse([], seeds);
                            return;
                        }

                        // partitions the operations by their pathSetIndex
                        var partitionOperationsAndSeeds = partitionOperations(
                            results,
                            missingPaths,
                            format,
                            relativeSeeds,
                            onNext);
                        recurse.apply(null, partitionOperationsAndSeeds);
                    });
            }

            // Else we need to onNext values and complete/error.
            else {
                if (!toPathValues && foundValue) {
                    onNextValues(
                        model,
                        onNext,
                        seeds,
                        selector);
                }
                onCompletedOrError(onCompleted, onError, errors);
            }
        }

        try {
            var operations = combineOperations(args, format, 'get');
            setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);
            recurse(operations, seeds);
        } catch(e) {
            errors = [e];
            onCompletedOrError(onCompleted, onError, errors);
        }
    };
};



