module.exports = set_json_graph_as_json_values;

var $ref = require("./../types/ref");

var clone = require("./../support/clone-dense-json");
var array_clone = require("./../support/array-clone");
var array_slice = require("./../support/array-slice");

var options = require("./../support/options");
var walk_path_set = require("./../walk/walk-path-set-soft-link");

var is_object = require("./../support/is-object");

var get_valid_key = require("./../support/get-valid-key");
var merge_node = require("./../support/merge-node");

var set_node_if_missing_path = require("./../support/treat-node-as-missing-path-set");
var set_node_if_error = require("./../support/treat-node-as-error");
var set_successful_paths = require("./../support/set-successful-paths");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_graph_as_json_values(model, envelopes, onNext, error_selector, comparator) {

    var roots = [];
    roots.offset = model._path.length;
    roots.bound = [];
    roots = options(roots, model, error_selector, comparator);

    var index = -1;
    var count = envelopes.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];

    roots[_cache] = roots.root;
    roots.onNext = onNext;

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

    return {
        values: null,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset) {

    var parent, messageParent;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        parent = parents[_cache];
        messageParent = parents[_message];
    } else {
        parent = nodes[_cache];
        messageParent = nodes[_message];
    }

    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[_message] = message;
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, requested);

    if (is_reference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        return;
    }

    if (is_branch) {
        parents[_cache] = node;
        parents[_message] = message;
    }
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {

    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);
    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        roots.onNext({
            path: array_slice(requested, roots.offset),
            value: clone(roots, node, type, node && node.value)
        });
    }
}