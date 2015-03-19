
var wrapNode = require("./wrap-node");
var graphNode = require("./graph-node");
var updateTree = require('./update-tree');
var replaceNode = require("./replace-node");
var generation = require("support/inc-generation");

module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var size  = node && node.$size || 0;
    var parent = opts.nodes[depth - 1];
    
    var message = opts.message;
    var type    = message && message.$type || undefined;
    var value   = type == "sentinel" ? message.value : message;
    
    node = replaceNode(opts.lru, parent, node, wrapNode(message, type, value), key)
    node = graphNode(root, parent, node, key, generation());
    type  = node.$type;
    value = type == "sentinel" ? node.value : node;
    
    var sizeOffset = size - node.$size;
    
    updateTree(opts, parent, sizeOffset);
    
    opts.node  = node;
    opts.type  = type;
    opts.value = value;
    
    return true;
}
