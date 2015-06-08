module.exports = set_cache;

var $error = require("falcor/types/error");
var $atom = require("falcor/types/atom");

var clone = require("falcor/support/clone-dense-json");
var array_clone = require("falcor/support/array-clone");

var options = require("falcor/support/options");
var walk_path_map = require("falcor/walk/walk-path-map");

var is_object = require("falcor/support/is-object");

var get_valid_key = require("falcor/support/get-valid-key");
var create_branch = require("falcor/support/create-branch");
var wrap_node = require("falcor/support/wrap-node");
var replace_node = require("falcor/support/replace-node");
var graph_node = require("falcor/support/graph-node");
var update_back_refs = require("falcor/support/update-back-refs");
var update_graph = require("falcor/support/update-graph");
var inc_generation = require("falcor/support/inc-generation");

var promote = require("falcor/lru/promote");

var positions = require("falcor/support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_cache(model, pathmap, error_selector) {

    var roots = options([], model, error_selector);
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var keys_stack = [];
    
    roots[_cache] = roots.root;

    walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);

    return model;
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        parent = parents[_cache];
    } else {
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = nodes[_cache] = node;
        return;
    }

    var selector = roots.error_selector;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var mess = pathmap;

    type = is_object(mess) && mess.$type || undefined;
    mess = wrap_node(mess, type, Boolean(type) ? mess.value : mess);
    type || (type = $atom);

    if (type == $error && Boolean(selector)) {
        mess = selector(requested, mess);
    }

    node = replace_node(parent, node, mess, key, roots.lru);
    node = graph_node(root, parent, node, key, inc_generation());
    update_graph(parent, size - node.$size, roots.version, roots.lru);
    nodes[_cache] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {
    if(depth > 0) {
        promote(roots.lru, nodes[_cache]);
    }
}