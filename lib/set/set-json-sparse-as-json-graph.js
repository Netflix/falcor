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

var node_as_miss = require("../support/treat-node-as-missing-path-map");
var node_as_error = require("../support/treat-node-as-error");
var clone_success = require("../support/clone-success-paths");

var promote = require("../lru/promote");
var collect = require("../lru/collect");

function set_json_sparse_as_json_graph(model, pathmaps, values, error_selector) {

    var roots = options([], model, error_selector);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var keys_stack = [];
    var json = values[0];
    var hasValue;

    roots[0] = roots.root;
    roots[1] = parents[1] = nodes[1] = json.jsong || (json.jsong = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var pathmap = pathmaps[index];
        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);
    }

    hasValue = roots.hasValue;
    if(hasValue) {
        json.jsong = roots[1];
    } else {
        delete json.jsong;
        delete json.paths;
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

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_top_level, is_branch, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[1];
        parent = parents[0];
    } else {
        json = nodes[1];
        parent = nodes[0];
    }

    var jsonkey = key;
    var node = parent[key],
        type;

    if (!is_top_level) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[0] = parent;
        nodes[0] = node;
        parents[1] = json;
        if (type == $path) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[1] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        type = node.$type;
        parents[0] = nodes[0] = node;
        parents[1] = json;
        if (type == $path) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[1] = json[jsonkey] || (json[jsonkey] = {});
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

    json[jsonkey] = clone(roots, node, type, node && node.value);
    roots.hasValue = true;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[0];
    var type = is_object(node) && node.$type || (node = undefined);

    if (node_as_miss(roots, node, type, pathmap, keys_stack, depth, requested, optimized) === false) {
        clone_success(roots, requested, optimized);
        promote(roots.lru, node);
        if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[1];
            json.$type = node.$type;
            json.value = node.value;
        }
        roots.hasValue = true;
    }
}