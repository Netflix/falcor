module.exports = set_json_values_as_json_values;

var $error = require("../types/$error");
var $sentinel = require("../types/$sentinel");

var clone = require("../support/clone-dense-json");
var array_clone = require("../support/array-clone");

var options = require("../support/options");
var walk_path_set = require("../walk/walk-path-set");

var is_object = require("../support/is-object");

var get_valid_key = require("../support/get-valid-key");
var create_branch = require("../support/create-branch");
var wrap_node = require("../support/wrap-node");
var replace_node = require("../support/replace-node");
var graph_node = require("../support/graph-node");
var update_back_refs = require("../support/update-back-refs");
var update_graph = require("../support/update-graph");
var inc_generation = require("../support/inc-generation");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");
var clone_success = require("../support/clone-success-paths");

var collect = require("../lru/collect");

function set_json_values_as_json_values(model, pathvalues, onNext, error_selector) {

    var roots = options([], model, error_selector);
    var index = -1;
    var count = pathvalues.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];

    roots[0] = roots.root;
    roots.onNext = onNext;

    while (++index < count) {
        var pv = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;
        walk_path_set(onNode, onEdge, pathset, roots, parents, nodes, requested, optimized);
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
        values: null,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_top_level, key, keyset, is_keyset) {

    var parent;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        parent = parents[0];
    } else {
        parent = nodes[0];
    }

    var node = parent[key],
        type;

    if (!is_top_level) {
        type = is_object(node) && node.$type || undefined;
        type = type && pathset.length > 1 && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[0] = parent;
        nodes[0] = node;
        return;
    }

    if (pathset.length > 1) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[0] = nodes[0] = node;
        return;
    }

    var selector = roots.error_selector;
    var root = roots[0];
    var size = is_object(node) && node.$size || 0;
    var mess = roots.value;

    type = is_object(mess) && mess.$type || undefined;
    mess = wrap_node(mess, type, !!type ? mess.value : mess);
    type || (type = $sentinel);

    if (type == $error && !!selector) {
        mess = selector(requested, mess);
    }

    node = replace_node(parent, node, mess, key, roots.lru);
    node = graph_node(root, parent, node, key, inc_generation());
    update_graph(parent, size - node.$size, roots.version, roots.lru);
    nodes[0] = node;
}

function onEdge(pathset, roots, parents, nodes, requested, optimized, key, keyset) {

    var node = nodes[0];
    var type = is_object(node) && node.$type || (node = undefined);

    if (node_as_miss(roots, node, type, pathset, requested, optimized) === false) {
        clone_success(roots, requested, optimized);
        if (node_as_error(roots, node, type, requested) === false) {
            roots.onNext({
                path: array_clone(requested),
                value: clone(roots, node, type, node && node.value)
            });
        }
    }
}