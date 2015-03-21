
var isArray = Array.isArray;
var graphNode = require("./graph-node");
var replaceNode = require("./replace-node");
var updateBackRefs = require("./update-back-refs");

module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var type  = opts.type;
    
    if(!!type || node == null || typeof node != "object") {
        return false;
    }
    
    if(key != null) {
        
        var optimizedPath = opts.optimizedPath;
        optimizedPath[depth + (opts.linkHeight - opts.linkIndex)] = key;
        
        var parent = node;
        
        node  = node[key];
        type  = node && node.$type;
        
        if(!!type || node == null || typeof node != "object") {
            type = undefined;
            node = replaceNode(opts.lru, parent, node, Object.create(null), key);
            node = graphNode(opts.root, parent, node, key, 0);
            node = updateBackRefs(node, opts.version);
        }
        
        var nodes = opts.nodes;
        if(nodes) { nodes[depth] = node; }
        
        opts.type  = type;
        opts.node  = node;
    }
    
    return true;
}