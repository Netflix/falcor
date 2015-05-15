module.exports = set_json_sparse_as_json_graph;

var $path = require("../types/path");
var $error = require("../types/error");
var $atom = require("../types/atom");

var clone = require("../support/clone-graph-json");
var array_clone = require("../support/array-clone");

var options = require("../support/options");
var walk_path_map = require("../walk/walk-path-map-soft-link");

var is_object = require("../support/is-object");

var get_valid_key = require("../support/get-valid-key");
var create_branch = require("../support/create-branch");
var wrap_node = require("../support/wrap-node");
var replace_node = require("../support/replace-node");
var graph_node = require("../support/graph-node");
var update_back_refs = require("../support/update-back-refs");
var update_graph = require("../support/update-graph");
var inc_generation = require("../support/inc-generation");

// var set_node_if_missing_path = require("../support/treat-node-as-missing-path-map");
var set_node_if_error = require("../support/treat-node-as-error");
var set_successful_paths = require("../support/set-successful-paths");

var promote = require("../lru/promote");

var positions = require("../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_sparse_as_json_graph(model, pathmaps, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var keys_stack = [];
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_jsong] = parents[_jsong] = nodes[_jsong] = json.jsong || (json.jsong = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var pathmap = pathmaps[index].json;
        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.jsong = roots[_jsong];
    } else {
        delete json.jsong;
        delete json.paths;
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValue,
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
        json = parents[_jsong];
        parent = parents[_cache];
    } else {
        json = nodes[_jsong];
        parent = nodes[_cache];
    }

    var jsonkey = key;
    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        parents[_jsong] = json;
        if (type == $path) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        type = node.$type;
        parents[_cache] = nodes[_cache] = node;
        parents[_jsong] = json;
        if (type == $path) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, Boolean(type) ? message.value : message);
    type || (type = $atom);

    if (type == $error && Boolean(selector)) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = true;

    if(Boolean(comparator)) {
        is_distinct = roots.is_distinct = comparator(requested, node, message);
    }

    if (is_distinct) {
        node = replace_node(parent, node, message, key, roots.lru);
        node = graph_node(root, parent, node, key, inc_generation());
        update_graph(parent, size - node.$size, roots.version, roots.lru);

        json[jsonkey] = clone(roots, node, type, node && node.value);
        roots.hasValue = true;
    }
    nodes[_cache] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    promote(roots.lru, node);

    set_successful_paths(roots, requested, optimized);

    if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
        node = clone(roots, node, type, node && node.value);
        json = roots[_jsong];
        json.$type = node.$type;
        json.value = node.value;
    }
    roots.hasValue = true;
}