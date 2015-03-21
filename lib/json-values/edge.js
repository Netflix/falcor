var clone = require("../support/clone");
var clonePathValue = require("./clonePathValue");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var type  = opts.type;
    
    if(opts.materialized || (!!type && (type != "error" || opts.errorsAsValues))) {
        
        opts.requestedPaths.push(clone(opts.requestedPath));
        opts.optimizedPaths.push(clone(opts.optimizedPath));
        
        var value = !!type ? node.value : node;
        var onNext, values = opts.values;
        
        if(values != null) {
            values.push(clonePathValue(opts, node, value, opts.requestedPath));
        } else if((onNext = opts.onNext) != null) {
            onNext(clonePathValue(opts, node, value, opts.requestedPath));
        }
        
        return false;
    }
    
    return true;
}