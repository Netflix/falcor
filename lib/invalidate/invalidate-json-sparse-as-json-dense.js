module.exports = invalidate_json_sparse_as_json_dense;

var clone = require("falcor/support/clone-dense-json");
var array_clone = require("falcor/support/array-clone");
var array_slice = require("falcor/support/array-slice");

var options = require("falcor/support/options");
var walk_path_map = require("falcor/walk/walk-path-map");

var is_object = require("falcor/support/is-object");

var get_valid_key = require("falcor/support/get-valid-key");
var update_graph = require("falcor/support/update-graph");
var invalidate_node = require("falcor/support/invalidate-node");

var positions = require("falcor/support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function invalidate_json_sparse_as_json_dense(model, pathmaps, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var keys_stack = [];
    var json, hasValue, hasValues;

    roots[_cache] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (is_object(json)) {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {})
        } else {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = undefined;
        }

        var pathmap = pathmaps[index].json;
        roots.index = index;

        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);

        hasValue = roots.hasValue;
        if (Boolean(hasValue)) {
            hasValues = true;
            if (is_object(json)) {
                json.json = roots.json;
            }
            delete roots.json;
            delete roots.hasValue;
        } else if (is_object(json)) {
            delete json.json;
        }
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValues,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_json];
        parent = parents[_cache];
    } else {
        json = is_keyset && nodes[_json] || parents[_json];
        parent = nodes[_cache];
    }

    var node = parent[key];

    if (is_reference) {
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
        if (is_keyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    nodes[_cache] = node;

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidate_node(parent, node, key, lru);
    update_graph(parent, size, version, lru);
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    if (keyset == null) {
        roots.json = clone(roots, node, type, node && node.value);
    } else if (Boolean(json = parents[_json])) {
        json[keyset] = clone(roots, node, type, node && node.value);
    }
    roots.hasValue = true;
    roots.requestedPaths.push(array_slice(requested, roots.offset));
}