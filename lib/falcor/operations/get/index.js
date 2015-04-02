var combineOperations = require('../support/combineOperations');
var partitionOperations = require('../support/partitionOperations');
var getSourceRequest = require('./getSourceRequest');
var processOperations = require('../support/processOperations');
var setSeedsOnGroups = require('../support/setSeedsOnGroups');
var onNextValues = require('../support/onNextValue');
var onCompletedOrError = require('../support/onCompletedOrError');

module.exports = function get(model, args, selector) {
    return function(options) {
        var onNext = options.onNext.bind(options),
            onError = options.onError.bind(options),
            onCompleted = options.onCompleted.bind(options),
            errorSelector = model._errorSelector,
            isProgressive = options.isProgressive,
            valuesCount = selector && selector.length || 0;

        // State variables
        var seeds = [];
        var shouldRequest = true;
        var atLeastOneValue = false;
        var errors = [];
        var format = selector && 'AsJSON' ||
            options.format || 'AsPathMap';
        var toJSONG = format === 'AsJSONG';
        var toJSON = format === 'AsPathMap';
        var toPathValues = format === 'AsValues';
        var seedRequired = toJSON || toJSONG || selector;
        var i;
        var foundValue = false;

        if (selector) {
            for (i = 0; i < args.length; i++) {
                if (i < valuesCount) {
                    seeds.push({});
                }
            }
        } else if (seedRequired) {
            seeds[0] = {};
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
            if (shouldRequest && isMissing && model._dataSource) {
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

            // align the seeds to each argument
            // or adds the onNext function to each operation
            if (seedRequired) {
                setSeedsOnGroups(operations, seeds, selector);
            } else {
                for (i = 0; i < operations.length; i++) {
                    operations[i].onNext = onNext;
                }
            }
            recurse(operations, seeds);
        } catch(e) {
            errors = [e];
            onCompletedOrError(onCompleted, onError, errors);
        }
    };
};



