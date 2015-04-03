var combineOperations = require('../support/combineOperations');
var setSourceRequest = require('./setSourceRequest');
var processOperations = require('../support/processOperations');
var setSeedsOrOnNext = require('../support/setSeedsOrOnNext');
var onNextValues = require('../support/onNextValue');
var onCompletedOrError = require('../support/onCompletedOrError');
var mergeBoundPath = require('../support/mergeBoundPath');
var primeSeeds = require('../support/primeSeeds');

module.exports = function set(model, args, selector) {
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
        var boundPath = model._path;
        var i;
        var foundValue = false;
        var seeds = primeSeeds(selector, selectorLength);

        function recurse(operations, relativeSeeds) {
            var combinedResults = processOperations(
                model,
                operations,
                errorSelector);


            foundValue = foundValue || combinedResults.valuesReceived;

            if (shouldRequest) {

                // gather all the paths and jsongs into one.
                var jsong = relativeSeeds[0].jsong;
                var paths = relativeSeeds[0].paths;
                for (i = 1; i < relativeSeeds.length; i++) {
                    paths = paths.concat(relativeSeeds[i].paths);
                }

                var jsongEnv = {jsong: jsong, paths: paths};
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
                        // Sets the results into the model.
                        model._setJSONGsAsJSON(model, [results], []);

                        // Gets the original paths / maps back out.
                        var operations = combineOperations(args, format, 'get');
                        setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);
                        recurse(operations, seeds);
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
            var firstFormat = shouldRequest && 'AsJSONG' || format;
            var operations = combineOperations(args, firstFormat, 'set', shouldRequest && selector);
            var firstSeeds = seeds;
            if (shouldRequest && selector) {

                // Share the same jsong env in the jsong but not in the paths.
                // This will be required for selector functions
                var jsong = {};
                firstSeeds = [];
                operations.forEach(function(op) {
                    var seed = {
                        jsong: jsong,
                        paths: []
                    };
                    op.seeds = [seed];
                    firstSeeds.push(seed);
                });

            } else if (shouldRequest) {
                firstSeeds = [{}];
                setSeedsOrOnNext(operations, seedRequired, firstSeeds, false, selector);
            } else {
                operations = combineOperations(args, format, 'set');
                setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);
                firstSeeds = seeds;
            }

            recurse(operations, firstSeeds);
        } catch(e) {
            errors = [e];
            onCompletedOrError(onCompleted, onError, errors);
        }
    };
};

