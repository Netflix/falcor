var clone = require("../support/clone");
var cloneJSON = require("./cloneJSON");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var index    = opts.index;
    var offset   = opts.offset;
    var values   = opts.values;
    var jsonRoot = values && values[index];
    
    // Only create an edge if:
    //  1. The caller supplied a JSON root seed.
    //  2. The path depth is past the bound path length.
    //  3. The current node is a branch or reference.
    if(jsonRoot != null && depth >= offset) {
        
        var node  = opts.node;
        var type  = opts.type;
        
        if(opts.materialized || (!!type && (type != "error" || opts.errorsAsValues))) {
            
            opts.hasValue = true;
            
            opts.requestedPaths.push(clone(opts.requestedPath));
            opts.optimizedPaths.push(clone(opts.optimizedPath));
            
            var value = !!type ? node.value : node;
            var keysets  = opts.keysets;
            var jsons = opts.jsons;
            var jsonKey = undefined;
            var jsonDepth = depth;
            var jsonParent;
            
            do {
                if (jsonKey == null) { jsonKey = keysets[jsonDepth]; }
                if ((jsonParent = jsons[--jsonDepth]) != null && (jsonKey != null)) {
                    jsonParent[jsonKey] = cloneJSON(opts, node, type, value);
                    break;
                }
            } while(jsonDepth >= offset - 2);
            
            return false;
        }
    }
    return true;
}