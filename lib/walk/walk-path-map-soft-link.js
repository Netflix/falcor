module.exports = walk_path_map;

var prefix = require("./../internal/prefix");
var $ref = require("./../types/ref");

var walk_reference = require("./../walk/walk-reference");

var array_slice = require("./../support/array-slice");
var array_clone    = require("./../support/array-clone");
var array_append   = require("./../support/array-append");

var is_expired = require("./../support/is-expired");
var is_primitive = require("./../support/is-primitive");
var is_object = require("./../support/is-object");
var is_array = Array.isArray;

var promote = require("./../lru/promote");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function walk_path_map(onNode, onValueType, pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {

    var node = nodes[_cache];

    if(is_primitive(pathmap) || is_primitive(node)) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var type = node.$type;

    while(type === $ref) {

        if(is_expired(roots, node)) {
            nodes[_cache] = undefined;
            return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
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
            return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
        } else if(is_primitive(node) || ((type = node.$type) && type != $ref)) {
            onNode(pathmap, roots, parents, nodes, requested, optimized, false, null, keyset, false);
            return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, array_append(requested, null), optimized, key, keyset);
        }
    }

    if(type != null) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var keys = keys_stack[depth] = Object.keys(pathmap);

    if(keys.length == 0) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var is_outer_keyset = keys.length > 1;

    for(var i = -1, n = keys.length; ++i < n;) {

        var inner_key = keys[i];

        if((inner_key[0] === prefix) || (inner_key[0] === "$")) {
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
                if((child_key[0] === prefix) || (child_key[0] === "$")) {
                    continue;
                }
                child_key = pathmap2.hasOwnProperty(child_key);
                break;
            }
            is_branch = child_key === true;
        }

        requested2 = array_append(requested, inner_key);
        optimized2 = array_append(optimized, inner_key);
        onNode(pathmap2, roots, parents2, nodes2, requested2, optimized2, false, is_branch, inner_key, inner_keyset, is_outer_keyset);

        if(is_branch) {
            walk_path_map(onNode, onValueType,
                pathmap2, keys_stack, depth + 1,
                roots, parents2, nodes2,
                requested2, optimized2,
                inner_key, inner_keyset, is_outer_keyset
            );
        } else {
            onValueType(pathmap2, keys_stack, depth + 1, roots, parents2, nodes2, requested2, optimized2, inner_key, inner_keyset);
        }
    }
}
