module.exports = invalidate_path_sets_as_json_dense;

var clone = require("../support/clone-dense-json");
var array_clone = require("../support/array-clone");

var options = require("../support/options");
var walk_path_set = require("../walk/walk-path-set");

var is_object = require("../support/is-object");

var get_valid_key = require("../support/get-valid-key");
var update_graph = require("../support/update-graph");
var invalidate_node = require("../support/invalidate-node");

var collect = require("../lru/collect");

function invalidate_path_sets_as_json_dense(model, pathsets, values) {

    var roots = options([], model);
    var index = -1;
    var count = pathsets.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json, hasValue, hasValues;

    roots[0] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (is_object(json)) {
            roots[3] = parents[3] = nodes[3] = json.json || (json.json = {})
        } else {
            roots[3] = parents[3] = nodes[3] = undefined;
        }

        var pathset = pathsets[index];
        
        walk_path_set(onNode, onEdge, pathset, roots, parents, nodes, requested, optimized);

        hasValue = roots.hasValue;
        if (!!hasValue) {
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
        hasValue: hasValues,
        requestedPaths: roots.requestedPaths.concat([requested]),
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_top_level, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[3];
        parent = parents[0];
    } else {
        json = is_keyset && nodes[3] || parents[3];
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
        if (is_keyset && !!(parents[3] = json)) {
            nodes[3] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    nodes[0] = node;

    if (!!json) {
        var type = is_object(node) && node.$type || undefined;
        var jsonkey = keyset;
        if (jsonkey == null) {
            json = roots;
            jsonkey = 3;
        }
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
}