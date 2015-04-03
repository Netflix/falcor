module.exports = invalidate_path_sets_as_json_sparse;

var clone = require("../support/clone-dense-json");
var array_clone = require("../support/array-clone");
var clone_requested_path = require("../support/clone-requested-path");

var options = require("../support/options");
var walk_path_set = require("../walk/walk-path-set");

var is_object = require("../support/is-object");

var get_valid_key = require("../support/get-valid-key");
var update_graph = require("../support/update-graph");
var invalidate_node = require("../support/invalidate-node");

var collect = require("../lru/collect");

function invalidate_path_sets_as_json_sparse(model, pathsets, values) {

    var roots = options([], model);
    var index = -1;
    var count = pathsets.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json = values[0];
    var hasValue;

    roots[0] = roots.root;
    roots[3] = parents[3] = nodes[3] = json.json || (json.json = {});

    while (++index < count) {
        var pathset = pathsets[index];
        walk_path_set(onNode, onEdge, pathset, roots, parents, nodes, requested, optimized);
    }

    var hasValue = roots.hasValue;
    if (!hasValue) {
        delete json.json;
    }

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
        hasValue: hasValue,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_top_level, key, keyset, is_keyset) {

    var parent, json, jsonkey;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        jsonkey = get_valid_key(requested);
        json = parents[3];
        parent = parents[0];
    } else {
        jsonkey = key;
        json = nodes[3];
        parent = nodes[0];
    }

    var node = parent[key];

    if (!is_top_level) {
        parents[0] = parent;
        nodes[0] = node;
        return;
    }

    if (pathset.length > 1) {
        parents[0] = nodes[0] = node;
        if (!!(parents[3] = json)) {
            nodes[3] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    nodes[0] = node;

    if (!!json) {
        var type = is_object(node) && node.$type || undefined;
        json[jsonkey] = clone(roots, node, type, node && node.value);
    }

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidate_node(parent, node, key, roots.lru);
    update_graph(parent, size, version, lru);
}

function onEdge(pathset, roots, parents, nodes, requested, optimized, key, keyset) {
    roots.json = roots[3];
    roots.hasValue = true;
    roots.requestedPaths.push(clone_requested_path(roots.bound, requested, pathset, roots.index));
}