var incVersion = require("./../support/inc-version");
var getBoundValue = require("./../get/getBoundValue");

/**
 * TODO: more options state tracking comments.
 */
module.exports = function getInitialState(options, model, errorSelector, comparator) {

    var bound = options.bound || (options.bound = model._path || []);
    var root = options.root || (options.root = model._root.cache);
    var nodes = options.nodes || (options.nodes = []);
    var lru = options.lru || (options.lru = model._root);
    options.expired = options.expired || lru.expired;
    options.errors = options.errors || [];
    options.requestedPaths = options.requestedPaths || [];
    options.optimizedPaths = options.optimizedPaths || [];
    options.requestedMissingPaths = options.requestedMissingPaths || [];
    options.optimizedMissingPaths = options.optimizedMissingPaths || [];
    options.boxed = model._boxed || false;
    options.materialized = model._materialized;
    options.errorsAsValues = model._treatErrorsAsValues || false;
    options.noDataSource = model._source == null;
    options.version = model._version = incVersion();

    options.offset = options.offset || 0;
    options.errorSelector = errorSelector || model._errorSelector;
    options.comparator = comparator;

    if (bound.length) {
        nodes[0] = getBoundValue(model, bound).value;
    } else {
        nodes[0] = root;
    }

    return options;
};
