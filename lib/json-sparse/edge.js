var isArray = Array.isArray;
var clone = require("support/clone");
var cloneJSONValue = require("./cloneJSONValue");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var offset   = opts.offset;
    var jsonRoot = opts.jsonRoot;
    
    // Only create an edge if:
    //  1. The caller supplied a JSON root seed.
    //  2. The path depth is past the bound path length.
    //  3. The current node is a branch or reference.
    if(jsonRoot != null && depth >= offset) {
        
        var node  = opts.node;
        var type  = opts.type;
        var value = opts.value;
        
        if((opts.materialized                             ) || (
            type && type != "error" || opts.errorsAsValues) || (
            node != null && typeof node !== "object"      ) || (
            isArray(value)                                  )) {
            
            opts.requestedPaths.push(clone(opts.requestedPath));
            opts.optimizedPaths.push(clone(opts.optimizedPath));
            
            var keysets  = opts.keysets;
            var jsons = opts.jsons;
            var jsonKey = undefined;
            var jsonDepth = depth;
            var jsonParent, json;
            
            do {
                if (jsonKey == null) { jsonKey = keysets[jsonDepth]; }
                if ((jsonParent = jsons[--jsonDepth]) != null && (jsonKey != null)) {
                    json = cloneJSONValue(opts, node, value);
                    if(json != null && typeof json == "object") {
                        json["__key"] = jsonKey;
                        json["__generation"] = (node["__generation"] || 0) + 1;
                    }
                    jsonParent[jsonKey] = json;
                    break;
                }
            } while(jsonDepth >= offset - 2);
            
            return false;
        }
    }
    return true;
}