var combineOperations = require('../support/combineOperations');
var setSourceRequest = require('./setSourceRequest');
var processOperations = require('../support/processOperations');
var setSeedsOrOnNext = require('../support/setSeedsOrOnNext');
var onNextValues = require('../support/onNextValue');
var onCompletedOrError = require('../support/onCompletedOrError');
var mergeBoundPath = require('../support/mergeBoundPath');

module.exports = function set(model, args, selector) {
    return function(options) {
        var onNext = options.onNext.bind(options),
            onError = options.onError.bind(options),
            onCompleted = options.onCompleted.bind(options),
            errorSelector = model._errorSelector,
            isProgressive = options.isProgressive,
            valuesCount = selector && selector.length || 0;

        // State variables
        var seeds = [];
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

            foundValue = foundValue || combinedResults.valuesReceived;

            // The should request for set looks different, it assumes that
            // the relativeSeeds is of length 1.
            if (shouldRequest && isMissing) {
                var jsongEnv = relativeSeeds[0];
                setSourceRequest(
                    model,
                    jsongEnv,
                    function onCompleteFromSourceSet(err, results) {
                        shouldRequest = false;
                        if (err) {
                            errors = errors.concat(err);
                            recurse([], seeds);
                            return;
                        }

                        results.paths = mergeBoundPath(model, results);
                        recurse(
                            buildSetOperations(
                                [results],
                                format,
                                seedRequired || shouldRequest,
                                firstSeeds,
                                onNext,
                                !shouldRequest && selector),
                            firstSeeds);
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
            var recurseSeeds, operations;
            if (shouldRequest) {

            } else {
                operations = combineOperations(args, format, 'set');
                setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);
                recurseSeeds = seeds;
            }

            recurse(operations, recurseSeeds);
        } catch(e) {
            errors = [e];
            onCompletedOrError(onCompleted, onError, errors);
        }
    };
};

