module.exports = set_json_graph_as_json_graph;

var $path = require("../types/$path");

var clone = require("../support/clone-graph-json");
var array_clone = require("../support/array-clone");

var options = require("../support/options");
var walk_path_set = require("../walk/walk-path-set-soft-link");

var is_object = require("../support/is-object");

var get_valid_key = require("../support/get-valid-key");
var merge_node = require("../support/merge-node");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");
var clone_success = require("../support/clone-success-paths");

var collect = require("../lru/collect");

function set_json_graph_as_json_graph(model, envelopes, values, error_selector) {

    var roots = options([], model, error_selector);
    var index = -1;
    var count = envelopes.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json = values[0];
    var hasValue;

    roots[0] = roots.root;
    roots[1] = parents[1] = nodes[1] = json.jsong || (json.jsong = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong = envelope.jsong || envelope.values || envelope.value;
        var index2 = -1;
        var count2 = pathsets.length;
        roots[2] = jsong;
        nodes[2] = jsong;
        while (++index2 < count2) {
            var pathset = pathsets[index2];
            walk_path_set(onNode, onEdge, pathset, roots, parents, nodes, requested, optimized);
        }
    }

    var hasValue = roots.hasValue;

    collect(
        roots.lru,
        roots.expired,
        roots.version,
        roots.root.$size || 0,
        model._maxSize,
        model._collectRatio
    );

    return {
        values: values,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_top_level, key, keyset, is_keyset) {

    var parent, messageParent, json, jsonkey;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[1];
        parent = parents[0];
        messageParent = parents[2];
    } else {
        json = nodes[1];
        parent = nodes[0];
        messageParent = nodes[2];
    }

    var jsonkey = key;
    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[2] = message;
    nodes[0] = node = merge_node(roots, parent, node, messageParent, message, key);

    if (!is_top_level) {
        parents[0] = parent;
        parents[2] = messageParent;
        if (!!(parents[1] = json)) {
            nodes[1] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    var type = is_object(node) && node.$type || undefined;

    if (pathset.length > 1) {
        parents[0] = node;
        parents[2] = message;
        if (!!(parents[1] = json)) {
            if (type == $path) {
                json[jsonkey] = clone(roots, node, type, node.value);
            } else {
                nodes[1] = json[jsonkey] || (json[jsonkey] = {});
            }
        }
        return;
    }

    if (!!json) {
        json[jsonkey] = clone(roots, node, type, node && node.value);
    }
}

function onEdge(pathset, roots, parents, nodes, requested, optimized, key, keyset) {

    var node = nodes[0];
    var type = is_object(node) && node.$type || undefined;

    if (node_as_miss(roots, node, type, pathset, requested, optimized) === false) {
        clone_success(roots, requested, optimized);
        // if(node_as_error(roots, node, type, requested) === false) {
        roots.hasValue = true;
        // }
    }
}