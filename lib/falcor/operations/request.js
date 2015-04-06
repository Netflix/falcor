var setSeedsOrOnNext = require('./support/setSeedsOrOnNext');
var onNextValues = require('./support/onNextValue');
var onCompletedOrError = require('./support/onCompletedOrError');
var primeSeeds = require('./support/primeSeeds');
var autoTrue = function() { return true; };

module.exports = request;

function request(initialArgs, sourceRequest, processOperations, shouldRequestFn) {
    if (!shouldRequestFn) {
        shouldRequestFn = autoTrue;
    }
    return function innerRequest(options) {
        var selector = options.operationSelector;
        var model = options.operationModel;
        var args = options.operationArgs;
        var onNext = options.onNext.bind(options);
        var onError = options.onError.bind(options);
        var onCompleted = options.onCompleted.bind(options);
        var errorSelector = model._errorSelector;
        var isProgressive = options.isProgressive;
        var selectorLength = selector && selector.length || 0;

        // State variables
        var errors = [];
        var format = options.format = selector && 'AsJSON' ||
            options.format || 'AsPathMap';
        var toJSONG = format === 'AsJSONG';
        var toJSON = format === 'AsPathMap';
        var toPathValues = format === 'AsValues';
        var seedRequired = toJSON || toJSONG || selector;
        var boundPath = model._path;
        var i;
        var foundValue = false;
        var seeds = primeSeeds(selector, selectorLength);

        function recurse(operations, relativeSeeds, shouldRequest, opts) {
            debugger
            var combinedResults = processOperations(
                model,
                operations,
                errorSelector,
                opts);

            foundValue = foundValue || combinedResults.valuesReceived;
            if (combinedResults.errors.length) {
                errors = errors.concat(combinedResults.errors);
            }

            if (shouldRequest && shouldRequestFn(model, combinedResults)) {
                sourceRequest(
                    options,
                    onNext,
                    seeds,
                    relativeSeeds,
                    combinedResults,
                    function onCompleteFromSourceSet(err, results) {
                        if (err) {
                            errors = errors.concat(err);
                            recurse([], seeds);
                            return;
                        }
                        recurse.apply(null, results);
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
            recurse.apply(null,
                initialArgs(options, seeds, onNext));
        } catch(e) {
            debugger
            errors = [e];
            onCompletedOrError(onCompleted, onError, errors);
        }
    };
}
