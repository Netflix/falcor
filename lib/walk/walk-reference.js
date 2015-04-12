module.exports = walk_reference;

var __ref = "__ref";
var is_object      = require("../support/is-object");
var is_primitive   = require("../support/is-primitive");
var array_slice    = require("../support/array-slice");
var array_append   = require("../support/array-append");

function walk_reference(onNode, container, reference, roots, parents, nodes, requested, optimized) {
    
    optimized.length = 0;
    
    var index = -1;
    var count = reference.length;
    var node, key, keyset;
    
    while(++index < count) {
        
        node = nodes[0];
        
        if(node == null) {
            return nodes;
        } else if(is_primitive(node) || node.$type) {
            onNode(reference, roots, parents, nodes, requested, optimized, false, false, keyset, null, false);
            return nodes;
        }
        
        do {
            key = reference[index];
            if(key != null) {
                keyset = key;
                optimized.push(key);
                onNode(reference, roots, parents, nodes, requested, optimized, false, index < count - 1, key, null, false);
                break;
            }
        } while(++index < count);
    }
    
    node = nodes[0];
    
    if(is_object(node) && container.__context !== node) {
        var backrefs = node.__refs_length || 0;
        node.__refs_length = backrefs + 1;
        node[__ref + backrefs] = container;
        container.__context    = node;
        container.__ref_index  = backrefs;
    }
    
    return nodes;
}