var clone = require("../support/clone");
var cloneJSON = require("./cloneJSON");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var json  = opts.json;
    
    if(key != null && json != null) {
        
        var jsonParent = json;
        var node  = opts.node;
        var type  = opts.type;
        var value = !!type ? node.value : node;
        
        // Create a JSONG branch, or insert the value if:
        //  1. The caller provided a JSONG root seed.
        //  2. The node is a branch or value, or materialized mode is on.
        
        if(!type && node != null && typeof node == "object") {
            if((json = jsonParent[key]) == null) {
                json = Object.create(null);
            } else if(typeof json !== "object") {
                throw new Error("Fatal Falcor Error: encountered value in branch position while building JSON Graph.");
            }
        } else {
            json = cloneJSON(opts, node, type, value);
        }
        
        opts.json = jsonParent[key] = json;
    }
    
    return true;
}
