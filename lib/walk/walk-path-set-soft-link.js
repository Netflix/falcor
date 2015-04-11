module.exports = walk_path_set;

var $path = require("../types/$path");
var empty_array = new Array(0);

var walk_reference = require("./walk-reference");

var array_slice    = require("../support/array-slice");
var array_clone    = require("../support/array-clone");
var array_append   = require("../support/array-append");

var is_expired = require("../support/is-expired");
var is_primitive = require("../support/is-primitive");
var is_object = require("../support/is-object");

var keyset_to_key  = require("../support/keyset-to-key");
var permute_keyset = require("../support/permute-keyset");

var promote = require("../lru/promote");

function walk_path_set(onNode, onEdge, pathset, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {
    
    var node = nodes[0];
    
    if(pathset.length == 0 || is_primitive(node)) {
        return onEdge(pathset, roots, parents, nodes, requested, optimized, key, keyset);
    }
    
    var type = node.$type;
    
    while(type === $path) {
        
        if(is_expired(roots, node)) {
            nodes[0] = undefined;
            return onEdge(pathset, roots, parents, nodes, requested, optimized, key, keyset);
        }
        
        promote(roots.lru, node);
        
        var container = node;
        var reference = node.value;
        
        nodes[0] = parents[0] = roots[0];
        nodes[1] = parents[1] = roots[1];
        nodes[2] = parents[2] = roots[2];
        
        walk_reference(onNode, container, reference, roots, parents, nodes, requested, optimized);
        
        node = nodes[0];
        
        if(node == null) {
            return onEdge(pathset, roots, parents, nodes, requested, optimized, key, keyset);
        } else if(is_primitive(node) || ((type = node.$type) && type != $path)) {
            onNode(empty_array, roots, parents, nodes, requested, optimized, true, false, null, keyset, false);
            return onEdge(pathset, roots, parents, nodes, array_append(requested, null), optimized, key, keyset);
        }
    }
    
    if(type != null) {
        return onEdge(pathset, roots, parents, nodes, requested, optimized, key, keyset);
    }
    
    var outer_key = pathset[0];
    var is_outer_keyset = is_object(outer_key);
    var is_branch = pathset.length > 1;
    var run_once = false;
    
    while(is_outer_keyset && permute_keyset(outer_key) && (run_once = true) || (run_once = !run_once)) {
        var inner_key, inner_keyset;
        
        if(is_outer_keyset === true) {
            inner_key = keyset_to_key(outer_key, true);
            inner_keyset = inner_key;
        } else {
            inner_key = outer_key;
            inner_keyset = keyset;
        }
        
        var nodes2 = array_clone(nodes);
        var parents2 = array_clone(parents);
        var requested2, optimized2;
        
        if(inner_key == null) {
            requested2 = array_append(requested, null);
            optimized2 = array_clone(optimized);
            // optimized2 = optimized;
            inner_key = key;
            inner_keyset = keyset;
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, true, is_branch, null, inner_keyset, false);
        } else {
            requested2 = array_append(requested, inner_key);
            optimized2 = array_append(optimized, inner_key);
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, true, is_branch, inner_key, inner_keyset, is_outer_keyset);
        }
        
        walk_path_set(onNode, onEdge,
            array_slice(pathset, 1),
            roots, parents2, nodes2,
            requested2, optimized2,
            inner_key, inner_keyset, is_outer_keyset
        );
    }
}