var combineOperations = require('../support/combineOperations');
var setSourceRequest = require('./setSourceRequest');
var processOperations = require('../support/processOperations');
var setSeedsOnGroups = require('../support/setSeedsOnGroups');
var onNextValues = require('../support/onNextValue');
var onCompletedOrError = require('../support/onCompletedOrError');

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

            foundValue = foundValue || combinedResults.valuesReceived;

            // The should request for set looks different, it assumes that
            // the relativeSeeds is of length 1.
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
                        debugger;
                        var operations = combineOperations(relativeSeeds, format, 'set');
                        setSeedsOnOps(operations, seedRequired, seeds, onNext, selector);

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
                setSeedsOnOps(operations, seedRequired, firstSeeds, false, selector);
            } else {
                setSeedsOnOps(operations, seedRequired, seeds, onNext, selector);
            }

            recurse(operations, firstSeeds);
        } catch(e) {
            errors = [e];
            onCompletedOrError(onCompleted, onError, errors);
        }
    };
};

function setSeedsOnOps(operations, seedRequired, seeds, onNext, selector) {

    // align the seeds to each argument
    // or adds the onNext function to each operation
    if (seedRequired) {
        setSeedsOnGroups(operations, seeds, selector);
    } else {
        for (i = 0; i < operations.length; i++) {
            operations[i].onNext = onNext;
        }
    }
}

