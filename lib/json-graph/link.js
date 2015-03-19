var isArray = Array.isArray;
var clone = require("support/clone");

module.exports = function(opts, set, depth, key, isKeySet) {
    
    var json  = opts.json;
    var jsons = opts.jsons;
    var node  = opts.node;
    var type  = opts.type;
    var value = opts.value;
    
    if(key != null && json != null) {
        
        var jsonParent = json;
        
        // Create a JSONG branch, or insert the value if:
        //  1. The caller provided a JSONG root seed.
        //  2. The node is a branch or value, or materialized mode is on.
        
        if(node != null) {
            if((!type || type == "sentinel") && isArray(value)) {
                if(opts.boxed === true) {
                    json = clone(node);
                } else {
                    json = clone(value);
                }
            } else if(!type && node != null && typeof node == "object") {
                if((json = jsonParent[key]) == null) {
                    json = Object.create(null);
                } else if(typeof json !== "object") {
                    throw new Error("Fatal Falcor Error: encountered value in branch position while building JSON Graph.");
                }
            } else if(opts.materialized === true) {
                if(node == null) {
                    json = Object.create(null);
                    json["$type"] = "sentinel";
                } else if(value === undefined) {
                    json = clone(node);
                } else {
                    json = clone(value);
                }
            } else if(opts.boxed === true) {
                json = node;
            } else if(opts.errorsAsValues === true || type !== "error") {
                if(node != null) {
                    json = clone(value);
                } else {
                    json = undefined;
                }
            } else {
                json = undefined;
            }
        } else if(opts.materialized === true) {
            json = Object.create(null);
            json["$type"] = "sentinel";
        } else {
            json = undefined;
        }
        
        if(jsons) { jsons[depth] = json; }
        
        opts.json = jsonParent[key] = json;
    }
    
    return true;
}
