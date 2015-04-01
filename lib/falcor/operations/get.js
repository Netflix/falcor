var buildOperations = require('./buildOperations');
var processOperations = require('./processOperations');
var ModelResponse = require('../ModelResponse');
var setSeedsOnGroups = require('./setSeedsOnGroups');
var onNextValues = require('./onNextValue');
var onCompleteOrError = require('./onCompleteOrError');

module.exports = function get() {
    var model = this, root = model._root,
        args = Array.prototype.slice.call(arguments),
        selector = args[args.length - 1];

    return ModelResponse.create(function(options) {
            var onNext = options.onNext.bind(options),
                onError = options.onError.bind(options),
                onCompleted = options.onCompleted.bind(options),
                errorSelector = model._errorSelector,
                isProgressive = options.isProgressive,
                valuesCount = selector && selector.length || 0;

            // State variables
            var seeds = [];
            var indices = [];
            var shouldRequest = true;
            var atLeastOneValue = false;
            var errors = [];
            var hasSelector = typeof selector === 'function';
            var format = hasSelector && 'AsJSON' ||
                options.format || 'AsPathMap';
            var toJSONG = format === 'AsJSONG';
            var toJSON = format === 'AsPathMap';
            var toPathValues = format === 'AsValues';
            var seedRequired = toJSON || toJSONG || hasSelector;

            if (hasSelector) {
                args.pop();
                for (var i = 0; i < args.length; i++) {
                    if (i < valuesCount) {
                        seeds.push({});
                    }
                    indices[indices.length] = i;
                }
            } else if (seedRequired) {
                seeds[0] = {};
            }

            function recurse(requested, relativeSeeds) {
                // The initial arguments need to be setup so that there
                // is only minimal required calls.
                var argsToOperation = buildOperations(requested, format, 'get');

                // align the seeds to each argument
                // or adds the onNext function to each operation
                if (seedRequired) {
                    setSeedsOnGroups(argsToOperation, relativeSeeds, hasSelector);
                } else {
                    for (var i = 0; i < argsToOperation.length; i++) {
                        argsToOperation[i].onNext = onNext;
                    }
                }

                // make the JSON-Graph call
                var combinedResults = processOperations(
                    model,
                    argsToOperation,
                    errorSelector);

                var isMissing = combinedResults.requestedMissingPaths.length;

                // Starts the async request process for the servers
                // data in the case of missing paths.
                if (shouldRequest && isMissing && model._source) {

                }

                // Else we need to onNext values and complete/error.
                else {
                    if (!toPathValues) {
                        onNextValues(model, onNext, seeds, hasSelector && selector);
                    }
                    onCompleteOrError(onCompleted, onError, errors);
                }
            }

            try {
                recurse(args, seeds);
            } catch(e) {
                errors = [e];
                onCompleteOrError(onCompleted, onError, errors);
            }
    });
};

