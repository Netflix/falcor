var isArray = Array.isArray;
var clone = require("support/clone");
var clonePathValue = require("./clonePathValue");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var type  = opts.type;
    var value = opts.value;
    
    if((opts.materialized                             ) || (
        type && type != "error" || opts.errorsAsValues) || (
        node != null && typeof node !== "object"      ) || (
        isArray(value)                                  )) {
        
        opts.requestedPaths.push(clone(opts.requestedPath));
        opts.optimizedPaths.push(clone(opts.optimizedPath));
        
        var onNext = opts.onNext, values = opts.values;
        
        if(onNext) {
            onNext(clonePathValue(opts, node, value, opts.requestedPath));
        } else if(values) {
            values.push(clonePathValue(opts, node, value, opts.requestedPath));
        }
        
        return false;
    }
    
    return true;
}