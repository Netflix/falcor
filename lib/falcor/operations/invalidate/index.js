var combineOperations = require('../support/combineOperations');
var processOperations = require('../support/processOperations');
var setSeedsOrOnNext = require('../support/setSeedsOrOnNext');
var onNextValues = require('../support/onNextValue');
var onCompletedOrError = require('../support/onCompletedOrError');
var primeSeeds = require('../support/primeSeeds');

function invalidate(model, args, selector) {
    return function(options) {
        var onNext = options.onNext.bind(options),
            onError = options.onError.bind(options),
            onCompleted = options.onCompleted.bind(options),
            valuesCount = selector && selector.length || 0;

        // State variables
        var format = selector && 'AsJSON' ||
            options.format || 'AsPathMap';
        var toJSONG = format === 'AsJSONG';
        var toJSON = format === 'AsPathMap';
        var toPathValues = format === 'AsValues';
        var seedRequired = toJSON || toJSONG || selector;
        var i;
        var foundValue = false;
        var seeds = primeSeeds(valuesCount, selector, seedRequired);

        try {
            var operations = combineOperations(args, format, 'inv');
            setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);

            // align the seeds to each argument
            // or adds the onNext function to each operation

            // make the JSON-Graph call
            var combinedResults = processOperations(
                model,
                operations);

            foundValue = foundValue || combinedResults.valuesReceived;

            if (!toPathValues && foundValue) {
                onNextValues(
                    model,
                    onNext,
                    seeds,
                    selector);
            }
            onCompletedOrError(onCompleted, onError, []);

        } catch(e) {
            onCompletedOrError(onCompleted, onError, [e]);
        }
    };
}

module.exports = invalidate;

