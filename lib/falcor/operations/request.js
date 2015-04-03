var processOperations = require('./support/processOperations');
var setSeedsOrOnNext = require('./support/setSeedsOrOnNext');
var onNextValues = require('./support/onNextValue');
var onCompletedOrError = require('./support/onCompletedOrError');
var primeSeeds = require('./support/primeSeeds');

module.exports = request;

function request(model, args, selector, buildInitialArgs, modelSourceRequest) {
    return function innerRequest(options) {
        var onNext = options.onNext.bind(options),
            onError = options.onError.bind(options),
            onCompleted = options.onCompleted.bind(options),
            errorSelector = model._errorSelector,
            isProgressive = options.isProgressive,
            selectorLength = selector && selector.length || 0;

        // State variables
        var errors = [];
        var format = selector && 'AsJSON' ||
            options.format || 'AsPathMap';
        var toJSONG = format === 'AsJSONG';
        var toJSON = format === 'AsPathMap';
        var toPathValues = format === 'AsValues';
        var seedRequired = toJSON || toJSONG || selector;
        var boundPath = model._path;
        var i;
        var foundValue = false;
        var seeds = primeSeeds(selector, selectorLength);
        var initialArgs = buildInitialArgs(model, args, seeds, format, selector, onNext);
        var sourceRequest = modelSourceRequest(model, args, seeds, format, selector, onNext);

        function recurse(operations, relativeSeeds, shouldRequest) {
            var combinedResults = processOperations(
                model,
                operations,
                errorSelector);

            foundValue = foundValue || combinedResults.valuesReceived;

            if (shouldRequest) {
                sourceRequest(
                    relativeSeeds,
                    function onCompleteFromSourceSet(err, results) {
                        if (err) {
                            errors = errors.concat(err);
                            recurse([], seeds);
                            return;
                        }
                        debugger;
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
            recurse.apply(null, initialArgs(seedRequired));
        } catch(e) {
            errors = [e];
            onCompletedOrError(onCompleted, onError, errors);
        }
    };
}
