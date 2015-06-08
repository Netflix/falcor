module.exports = walk_path_set;

var $ref = require("falcor/types/ref");

var walk_reference = require("falcor/walk/walk-reference");

var array_slice    = require("falcor/support/array-slice");
var array_clone    = require("falcor/support/array-clone");
var array_append   = require("falcor/support/array-append");

var is_expired = require("falcor/support/is-expired");
var is_primitive = require("falcor/support/is-primitive");
var is_object = require("falcor/support/is-object");

var keyset_to_key  = require("falcor/support/keyset-to-key");
var permute_keyset = require("falcor/support/permute-keyset");

var promote = require("falcor/lru/promote");

var positions = require("falcor/support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function walk_path_set(onNode, onValueType, pathset, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {

    var node = nodes[_cache];

    if(depth >= pathset.length || is_primitive(node)) {
        return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var type = node.$type;

    while(type === $ref) {

        if(is_expired(roots, node)) {
            nodes[_cache] = undefined;
            return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
        }

        promote(roots.lru, node);

        var container = node;
        var reference = node.value;

        nodes[_cache] = parents[_cache] = roots[_cache];
        nodes[_jsong] = parents[_jsong] = roots[_jsong];
        nodes[_message] = parents[_message] = roots[_message];

        walk_reference(onNode, container, reference, roots, parents, nodes, requested, optimized);

        node = nodes[_cache];

        if(node == null) {
            optimized = array_clone(reference);
            return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
        } else if(is_primitive(node) || ((type = node.$type) && type != $ref)) {
            onNode(pathset, roots, parents, nodes, requested, optimized, false, false, null, keyset, false);
            return onValueType(pathset, depth, roots, parents, nodes, array_append(requested, null), optimized, key, keyset);
        }
    }

    if(type != null) {
        return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var outer_key = pathset[depth];
    var is_outer_keyset = is_object(outer_key);
    var is_branch = depth < pathset.length - 1;
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
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, false, is_branch, null, inner_keyset, false);
        } else {
            requested2 = array_append(requested, inner_key);
            optimized2 = array_append(optimized, inner_key);
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, false, is_branch, inner_key, inner_keyset, is_outer_keyset);
        }

        walk_path_set(onNode, onValueType,
            pathset, depth + 1,
            roots, parents2, nodes2,
            requested2, optimized2,
            inner_key, inner_keyset, is_outer_keyset
        );
    }
}
