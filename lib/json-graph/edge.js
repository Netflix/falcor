var clone = require("../support/clone");
var cloneJSON = require("./cloneJSON");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var offset   = opts.offset;
    var values   = opts.values;
    var jsonRoot = values && values[0];
    
    // Only create an edge if:
    //  1. The caller supplied a JSON root seed.
    //  2. The path depth is past the bound path length.
    //  3. The current node is a branch or reference.
    if(jsonRoot != null && depth >= offset) {
        
        var node  = opts.node;
        var type  = opts.type;
        
        if(opts.materialized || !!type) {
            
            opts.hasValue = true;
            opts.requestedPaths.push(clone(opts.requestedPath));
            opts.optimizedPaths.push(clone(opts.optimizedPath));
            
            var value = !!type ? node.value : node;
            var keysets  = opts.keysets;
            var jsonParent = opts.json;
            
            if(jsonParent != null) {
                
                var jsonKey = undefined;
                var jsonDepth = depth;
                
                do {
                    jsonKey = keysets[jsonDepth--];
                    if(jsonKey != null) {
                        jsonParent[jsonKey] = cloneJSON(opts, node, type, value);
                        break;
                    }
                } while(jsonDepth >= 0);
            }
            
            return false;
        }
    }
    return true;
}