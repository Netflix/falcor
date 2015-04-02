var inc_version = require("../support/inc-version");
var getBoundValue = require('../get/getBoundValue');

module.exports = function(options, model, error_selector) {
    
    var version        = options.version = inc_version();
    var lru            = options.lru                   || (options.lru                   = model._root);
    var root           = options.root                  || (options.root                  = model._cache);
    var expired        = options.expired               || (options.expired               = lru.expired);
    var bound          = options.bound                 || (options.bound                 = model._path || []);
    var errors         = options.errors                || (options.errors                = []);
    var requested      = options.requestedPaths        || (options.requestedPaths        = []);
    var optimized      = options.optimizedPaths        || (options.optimizedPaths        = []);
    var missing_r      = options.requestedMissingPaths || (options.requestedMissingPaths = []);
    var missing_o      = options.optimizedMissingPaths || (options.optimizedMissingPaths = []);
    var nodes          = options.nodes                 || (options.nodes = []);
    var boxed          = options.boxed  = model._boxed || false;
    var materialized   = options.materialized = model._materialized;
    var errorsAsValues = options.errorsAsValues = model._treatErrorsAsValues || false;
    
    options.offset || (options.offset = 0);
    options.error_selector = error_selector || model._errorSelector;
    
    if(bound.length) {
        nodes[0] = getBoundValue(model, bound).value;
    } else {
        nodes[0] = root;
    }
    
    return options;
};