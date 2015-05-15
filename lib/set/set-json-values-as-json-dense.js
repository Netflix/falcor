module.exports = set_json_values_as_json_dense;

var $path = require("../types/path");
var $error = require("../types/error");
var $atom = require("../types/atom");

var clone = require("../support/clone-dense-json");
var array_clone = require("../support/array-clone");

var options = require("../support/options");
var walk_path_set = require("../walk/walk-path-set");

var is_object = require("../support/is-object");

var get_valid_key = require("../support/get-valid-key");
var create_branch = require("../support/create-branch");
var wrap_node = require("../support/wrap-node");
var invalidate_node = require("../support/invalidate-node");
var replace_node = require("../support/replace-node");
var graph_node = require("../support/graph-node");
var update_back_refs = require("../support/update-back-refs");
var update_graph = require("../support/update-graph");
var inc_generation = require("../support/inc-generation");

var set_node_if_missing_path = require("../support/treat-node-as-missing-path-set");
var set_node_if_error = require("../support/treat-node-as-error");
var set_successful_paths = require("../support/set-successful-paths");

var positions = require("../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_values_as_json_dense(model, pathvalues, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathvalues.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json, hasValue, hasValues;

    roots[_cache] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (is_object(json)) {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {})
        } else {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = undefined;
        }

        var pv = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;
        roots.index = index;

        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);

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

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

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

    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        if (is_keyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, Boolean(type) ? message.value : message);
        type || (type = $atom);

        if (type == $error && Boolean(selector)) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

        if (is_distinct) {
            node = replace_node(parent, node, message, key, roots.lru);
            node = graph_node(root, parent, node, key, inc_generation());
            update_graph(parent, size - node.$size, roots.version, roots.lru);
        }
    }

    nodes[_cache] = node;
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);
    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if(isMissingPath) {
        return;
    }

    set_successful_paths(roots, requested, optimized);
    
    var isError = set_node_if_error(roots, node, type, requested);

    if(isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        if (keyset == null) {
            roots.json = clone(roots, node, type, node && node.value);
        } else if (Boolean(json = parents[_json])) {
            json[keyset] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}