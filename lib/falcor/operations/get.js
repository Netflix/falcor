var combineOperations = require('./combineOperations');
var spreadOperations = require('./spreadOperations');
var performGetOnModelSource = require('./performGetOnModelSource');
var processOperations = require('./processOperations');
var setSeedsOnGroups = require('./setSeedsOnGroups');
var onNextValues = require('./onNextValue');
var onCompletedOrError = require('./onCompletedOrError');

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
                performGetOnModelSource(
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

                        // spreads the operations
                        var spreadAndSeeds = spreadOperations(
                            results,
                            missingPaths,
                            format,
                            relativeSeeds,
                            onNext);
                        recurse.apply(null, spreadAndSeeds);
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



