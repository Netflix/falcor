module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var type  = opts.type;
    
    if(!!type || node == null || typeof node != "object") {
        return false;
    }
    
    if(key != null) {
        
        var optimizedPath = opts.optimizedPath;
        optimizedPath[depth + (opts.linkHeight - opts.linkIndex)] = key;
        
        node  = node[key];
        type  = node && node.$type;
        
        var nodes = opts.nodes;
        if(nodes) { nodes[depth] = node; }
        
        opts.node  = node;
        opts.type  = type;
    }
    
    return true;
}