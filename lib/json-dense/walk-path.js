module.exports = walk_path;

var is_primitive   = require("../support/is-primitive");
var array_slice    = require("../support/array-slice");
var array_append   = require("../support/array-append");

function walk_path(onNode, path, roots, nodes, optimized) {
    
    var node = nodes[0];
    
    if(is_primitive(node) || node.$type) {
        return false;
    }
    
    if(path.length == 0) {
        return true;
    }
    
    var key = path[0];
    
    if(key != null) {
        optimized[optimized.length] = key;
        if(onNode(roots, nodes, key) === false) {
            return false;
        }
    }
    
    return walk_path(onNode, array_slice(path, 1), roots, nodes, optimized);
}