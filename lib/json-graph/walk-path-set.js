module.exports = walk_pathset;

var __ref          = "__ref";
var $path = "path";
var walk_path  = require("../json-dense/walk-path");

var keyset_to_key  = require("../support/keyset-to-key");
var permute_keyset = require("../support/permute-keyset");

var is_object      = require("../support/is-object");
var is_expired      = require("../support/is-expired");
var is_primitive   = require("../support/is-primitive");

var array_map      = require("../support/array-map");
var array_slice    = require("../support/array-slice");
var array_clone    = require("../support/array-clone");
var array_append   = require("../support/array-append");

function walk_pathset(onNode, onEdge, onLink, pathset, roots, parents, nodes, requested, optimized, key) {
    
    var node = nodes[0];
    
    if(pathset.length == 0 || is_primitive(node)) {
        return onEdge(pathset, roots, parents, nodes, requested, optimized, false, key);
    }
    
    var type = node.$type;
    
    while(type == $path) {
        if(is_expired(roots, node)) {
            nodes[0] = undefined;
            return onEdge(pathset, roots, parents, nodes, requested, optimized, false, key);
        } else {
            optimized.length = 0;
            var container = node;
            var reference = node.value;
            var ref_nodes = array_clone(roots);
            var success = walk_path(onLink, reference, roots, ref_nodes, optimized, false);
            node = nodes[0] = ref_nodes[0];
            nodes[1] = ref_nodes[1];
            nodes[2] = ref_nodes[2];
            if(node == null) {
                return onEdge(pathset, roots, parents, nodes, requested, optimized, false, key);
            } else {
                type = node.$type;
                if(success === true && node && (!type || type == $path)) {
                    var backrefs = node.__refs_length || 0;
                    node.__refs_length = backrefs + 1;
                    node[__ref + backrefs] = container;
                    container.__context    = node;
                    container.__ref_index  = backrefs;
                } else {
                    return onEdge(pathset, roots, parents, nodes, array_append(requested, null), optimized, true, key);
                }
            }
        }
    }
    
    if(type != null) {
        return onEdge(pathset, roots, parents, nodes, requested, optimized, false, key);
    }
    
    var outerkey = pathset[0];
    var iskeyset = is_object(outerkey);
    
    do {
        var innerkey = !iskeyset ? outerkey : keyset_to_key(outerkey, true);
        var parents2 = array_clone(parents);
        var nodes2   = array_clone(nodes);
        if(innerkey == null) {
            walk_pathset(onNode, onEdge, onLink,
                array_slice(pathset, 1),
                roots, parents2, nodes2,
                array_append(requested, innerkey),
                array_clone(optimized),
                key
            );
        } else {
            var recurse = onNode(pathset, roots, parents2, nodes2, requested, optimized, innerkey);
            if(recurse === false) {
                return onEdge(pathset, roots, parents2, nodes2, requested, optimized, false, key);
            } else {
                walk_pathset(onNode, onEdge, onLink,
                    array_slice(pathset, 1),
                    roots, parents2, nodes2,
                    array_append(requested, innerkey),
                    array_append(optimized, innerkey),
                    innerkey
                );
            }
        }
    } while(iskeyset && permute_keyset(outerkey));
}