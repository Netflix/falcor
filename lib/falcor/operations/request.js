var setSeedsOrOnNext = require('./support/setSeedsOrOnNext');
var onNextValues = require('./support/onNextValue');
var onCompletedOrError = require('./support/onCompletedOrError');
var primeSeeds = require('./support/primeSeeds');
var autoFalse = function() { return false; };

module.exports = request;

function request(initialArgs, sourceRequest, processOperations, shouldRequestFn) {
    if (!shouldRequestFn) {
        shouldRequestFn = autoFalse;
    }
    return function innerRequest(options) {
        var selector = options.operationSelector;
        var model = options.operationModel;
        var args = options.operationArgs;
        var onNext = options.onNext.bind(options);
        var onError = options.onError.bind(options);
        var onCompleted = options.onCompleted.bind(options);
        var isProgressive = options.operationIsProgressive;
        var errorSelector = model._errorSelector;
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
        var i, len;
        var foundValue = false;
        var seeds = primeSeeds(selector, selectorLength);
        var loopCount = 0;

        function recurse(operations, opts) {
            if (loopCount > 50) {
                throw 'Loop Kill switch thrown.';
            }
            var combinedResults = processOperations(
                model,
                operations,
                errorSelector,
                opts);

            foundValue = foundValue || combinedResults.valuesReceived;
            if (combinedResults.errors.length) {
                errors = errors.concat(combinedResults.errors);
            }

            // if in progressiveMode, values are emitted
            // each time through the recurse loop.  This may have
            // to change when the router is considered.
            if (isProgressive && !toPathValues) {
                onNextValues(model, onNext, seeds, selector);
            }

            // Performs the recursing via dataSource
            if (shouldRequestFn(model, combinedResults, loopCount)) {
                sourceRequest(
                    options,
                    onNext,
                    seeds,
                    combinedResults,
                    opts,
                    function onCompleteFromSourceSet(err, results) {
                        if (err) {
                            errors = errors.concat(err);
                            recurse([], seeds);
                            return;
                        }
                        ++loopCount;

                        // We continue to string the opts through
                        recurse(results, opts);
                    });
            }

            // Else we need to onNext values and complete/error.
            else {
                if (!toPathValues && !isProgressive && foundValue) {
                    onNextValues(model, onNext, seeds, selector);
                }
                onCompletedOrError(onCompleted, onError, errors);
            }
        }

        try {
            recurse.apply(null,
                initialArgs(options, seeds, onNext));
        } catch(e) {
            errors = [e];
            onCompletedOrError(onCompleted, onError, errors);
        }
    };
}
