var isArray = Array.isArray;
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var type  = opts.type;
    var value = opts.value;
    
    if(!!type || node == null || typeof node != "object" || isArray(value)) {
        return false;
    }
    
    if(key != null) {
        
        var optimizedPath = opts.optimizedPath;
        optimizedPath[depth + (opts.linkHeight - opts.linkIndex)] = key;
        
        node  = node[key];
        type  = node && node.$type;
        value = type == "sentinel" ? node.value : node;
        
        var nodes = opts.nodes;
        if(nodes) { nodes[depth] = node; }
        
        opts.node  = node;
        opts.type  = type;
        opts.value = value;
    }
    
    return true;
}