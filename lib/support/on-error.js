var promote = require("../lru/promote");
var clone = require("./clone");
var clonePathValue = require("../json-values/clonePathValue");

module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var type  = opts.type;
    
    if(type == "error") {
        
        promote(opts.lru, node);
        
        var errors = opts.errors;
        if(errors) {
            errors.push(clonePathValue(opts, node, node.value, opts.requestedPath));
        }
        
        return false;
    }
    
    return true;
}