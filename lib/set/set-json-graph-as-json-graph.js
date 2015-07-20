module.exports = set_json_graph_as_json_graph;

var $ref = require("./../types/ref");
var __version = require("./../internal/version");

var clone = require("./../support/clone-graph-json");
var array_clone = require("./../support/array-clone");

var options = require("./../support/options");
var walk_path_set = require("./../walk/walk-path-set-soft-link");

var is_object = require("./../support/is-object");

var get_valid_key = require("./../support/get-valid-key");
var merge_node = require("./../support/merge-node");

var set_node_if_missing_path = require("./../support/treat-node-as-missing-path-set");
var set_node_if_error = require("./../support/treat-node-as-error");
var set_successful_paths = require("./../support/set-successful-paths");

var promote = require("./../lru/promote");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_graph_as_json_graph(model, envelopes, values, error_selector, comparator) {

    var modelRoot = model._root;
    var modelCache = model._cache;
    var initialVersion = modelCache[__version];

    var roots = [];
    roots.offset = 0;
    roots.bound = [];
    roots = options(roots, model, error_selector, comparator);

    var index = -1;
    var count = envelopes.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_jsong] = parents[_jsong] = nodes[_jsong] = json.jsonGraph || (json.jsonGraph = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong = envelope.jsonGraph || envelope.jsong || envelope.values || envelope.value;
        var index2 = -1;
        var count2 = pathsets.length;
        roots[_message] = jsong;
        nodes[_message] = jsong;
        while (++index2 < count2) {
            var pathset = pathsets[index2];
            walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
        }
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.jsonGraph = roots[_jsong];
    } else {
        delete json.jsonGraph;
        delete json.paths;
    }

    var newVersion = modelCache[__version];
    var rootChangeHandler = modelRoot.onChange;

    if(rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
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

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, messageParent, json, jsonkey;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_jsong];
        parent = parents[_cache];
        messageParent = parents[_message];
    } else {
        json = nodes[_jsong];
        parent = nodes[_cache];
        messageParent = nodes[_message];
    }

    var jsonkey = key;
    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[_message] = message;
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, requested);

    var type = is_object(node) && node.$type || undefined;

    if (is_reference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        parents[_jsong] = json;
        if (type === $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (is_branch) {
        parents[_cache] = node;
        parents[_message] = message;
        parents[_jsong] = json;
        if (type === $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if(roots.is_distinct === true) {
        roots.is_distinct = false;
        json[jsonkey] = clone(roots, node, type, node && node.value);
        roots.hasValue = true;
    }
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

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