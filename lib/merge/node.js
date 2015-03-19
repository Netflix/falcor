
var isArray = Array.isArray;

module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var message = opts.message;
    var type  = opts.type;
    var value = opts.value;
    
    var nodeIsArray = isArray(value);
    
    if(node == null && message == null) {
        return false;
    } else if(node == message && !type && !isArray(value)) {
        return true;
    }
    
    if(!!type || node == null || typeof node != "object" || isArray(value)) {
        return false;
    }
    
    if(key != null) {
        
        var optimizedPath = opts.optimizedPath;
        optimizedPath[depth + (opts.linkHeight - opts.linkIndex)] = key;
        
        var parent = node;
        var messageParent = message;
        
        node = parent[key];
        message = messageParent[key];
    }
};