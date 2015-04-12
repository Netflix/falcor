module.exports = walk_path_map;

var $path = require("../types/path");

var walk_reference = require("./walk-reference");

var array_slice = require("../support/array-slice");
var array_clone    = require("../support/array-clone");
var array_append   = require("../support/array-append");

var is_expired = require("../support/is-expired");
var is_primitive = require("../support/is-primitive");
var is_object = require("../support/is-object");
var is_array = Array.isArray;

var promote = require("../lru/promote");

function walk_path_map(onNode, onEdge, pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {
    
    var node = nodes[0];
    
    if(is_primitive(pathmap) || is_primitive(node)) {
        return onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }
    
    var type = node.$type;
    
    while(type === $path) {
        
        if(is_expired(roots, node)) {
            nodes[0] = undefined;
            return onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
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
            return onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
        } else if(is_primitive(node) || ((type = node.$type) && type != $path)) {
            onNode(pathmap, roots, parents, nodes, requested, optimized, true, null, keyset, false);
            return onEdge(pathmap, keys_stack, depth, roots, parents, nodes, array_append(requested, null), optimized, key, keyset);
        }
    }
    
    if(type != null) {
        return onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }
    
    var keys = keys_stack[depth] = Object.keys(pathmap);
    
    if(keys.length == 0) {
        return onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }
    
    var is_outer_keyset = keys.length > 1;
    
    for(var i = -1, n = keys.length; ++i < n;) {
        
        var inner_key = keys[i];
        
        if((inner_key[0] === "_"    && inner_key[1] === "_") || (
            inner_key[0] === "$"  ) || (
            inner_key    === "/"  ) || (
            inner_key    === "./" ) || (
            inner_key    === "../")  ) {
            continue;
        }
        
        var inner_keyset = is_outer_keyset ? inner_key : keyset;
        var nodes2 = array_clone(nodes);
        var parents2 = array_clone(parents);
        var pathmap2 = pathmap[inner_key];
        var requested2, optimized2, is_branch;
        var has_child_key = false;
        
        var is_branch = is_object(pathmap2) && !pathmap2.$type;// && !is_array(pathmap2);
        if(is_branch) {
            for(child_key in pathmap2) {
                if((child_key[0] === "_"    && child_key[1] === "_") || (
                    child_key[0] === "$"  ) || (
                    child_key    === "/"  ) || (
                    child_key    === "./" ) || (
                    child_key    === "../")  ) {
                    continue;
                }
                child_key = pathmap2.hasOwnProperty(child_key);
                break;
            }
            is_branch = child_key === true;
        }
        
        if(inner_key == "__null") {
            requested2 = array_append(requested, null);
            optimized2 = array_clone(optimized);
            inner_key  = key;
            inner_keyset = keyset;
            pathmap2 = pathmap;
            onNode(pathmap2, roots, parents2, nodes2, requested2, optimized2, true, is_branch, null, inner_keyset, false);
        } else {
            requested2 = array_append(requested, inner_key);
            optimized2 = array_append(optimized, inner_key);
            onNode(pathmap2, roots, parents2, nodes2, requested2, optimized2, true, is_branch, inner_key, inner_keyset, is_outer_keyset);
        }
        
        if(is_branch) {
            walk_path_map(onNode, onEdge,
                pathmap2, keys_stack, depth + 1,
                roots, parents2, nodes2,
                requested2, optimized2,
                inner_key, inner_keyset, is_outer_keyset
            );
        } else {
            onEdge(pathmap2, keys_stack, depth, roots, parents2, nodes2, requested2, optimized2, inner_key, inner_keyset);
        }
    }
}
