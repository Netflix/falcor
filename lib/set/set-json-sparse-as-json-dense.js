module.exports = set_json_sparse_as_json_dense;

var $path = require("../types/path");
var $error = require("../types/error");
var $atom = require("../types/atom");

var clone = require("../support/clone-dense-json");
var array_clone = require("../support/array-clone");

var options = require("../support/options");
var walk_path_map = require("../walk/walk-path-map");

var is_object = require("../support/is-object");

var get_valid_key = require("../support/get-valid-key");
var create_branch = require("../support/create-branch");
var wrap_node = require("../support/wrap-node");
var replace_node = require("../support/replace-node");
var graph_node = require("../support/graph-node");
var update_back_refs = require("../support/update-back-refs");
var update_graph = require("../support/update-graph");
var inc_generation = require("../support/inc-generation");

var node_as_miss = require("../support/treat-node-as-missing-path-map");
var node_as_error = require("../support/treat-node-as-error");
var clone_success = require("../support/clone-success-paths");

var collect = require("../lru/collect");

function set_json_sparse_as_json_dense(model, pathmaps, values, error_selector) {

    var roots = options([], model, error_selector);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var keys_stack = [];
    var json, hasValue, hasValues;

    roots[0] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (is_object(json)) {
            roots.json = roots[3] = parents[3] = nodes[3] = json.json || (json.json = {})
        } else {
            roots.json = roots[3] = parents[3] = nodes[3] = undefined;
        }

        var pathmap = pathmaps[index];
        roots.index = index;

        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);

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
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_top_level, is_branch, key, keyset, is_keyset) {

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

    var node = parent[key],
        type;

    if (!is_top_level) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[0] = parent;
        nodes[0] = node;
        return;
    }

    parents[3] = json;

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[0] = nodes[0] = node;
        if (is_keyset && !!json) {
            nodes[3] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var root = roots[0];
    var size = is_object(node) && node.$size || 0;
    var mess = pathmap;

    type = is_object(mess) && mess.$type || undefined;
    mess = wrap_node(mess, type, !!type ? mess.value : mess);
    type || (type = $atom);

    if (type == $error && !!selector) {
        mess = selector(requested, mess);
    }

    node = replace_node(parent, node, mess, key, roots.lru);
    node = graph_node(root, parent, node, key, inc_generation());
    update_graph(parent, size - node.$size, roots.version, roots.lru);
    nodes[0] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[0];
    var type = is_object(node) && node.$type || (node = undefined);

    if (node_as_miss(roots, node, type, pathmap, keys_stack, depth, requested, optimized) === false) {
        clone_success(roots, requested, optimized);
        if (node_as_error(roots, node, type, requested) === false) {
            if(keyset == null) {
                roots.json = clone(roots, node, type, node && node.value);
            } else if(!!(json = parents[3])) {
                json[keyset] = clone(roots, node, type, node && node.value);
            }
            roots.hasValue = true;
        }
    }
}