var clone = require("../support/clone");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var offset   = opts.offset;
    var values   = opts.values;
    var jsonRoot = values && values[0];
    
    // Only create a node if:
    //  1. The caller supplied a JSON root seed.
    //  2. The path depth is past the bound path length.
    //  3. The current node is a branch or reference.
    if(jsonRoot != null && depth >= offset) {
        
        var node  = opts.node;
        var type  = opts.type;
        var keysets  = opts.keysets;
        keysets[depth] = key;
        
        if((!type && node != null && typeof node == "object") || (type == "reference")) {
            
            var jsons = opts.jsons;
            var jsonParent = opts.json, json;
            var jsonKey = undefined;
            var jsonDepth = depth;
            
            do {
                jsonKey = keysets[jsonDepth--];
                if (jsonKey != null) {
                    if(type == "reference") {
                        json = jsonParent[jsonKey] = clone(node);
                    } else {
                        if((json = jsonParent[jsonKey]) == null) {
                            json = jsonParent[jsonKey] = Object.create(null);
                        } else if(typeof json !== "object") {
                            throw new Error("Fatal Falcor Error: encountered value in branch position while building Path Map.");
                        }
                        jsons[depth] = opts.json = json;
                    }
                    break;
                }
            } while(jsonDepth >= 0);
        }
    }
    return true;
}