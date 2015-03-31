module.exports = set_path_values_as_jsong;

var $path = require("../types/$path");
var $sentinel = require("../types/$sentinel");

var clone = require("./clone");

var promote = require("../lru/promote");
var collect = require("../lru/collect");

var walk_pathset = require("./walk-path-set");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");
var array_clone  = require("../support/array-clone");

var inc_version  = require("../support/inc-version");
var inc_generation = require("../support/inc-generation");

var get_valid_key = require("../support/get-valid-key");
var create_branch = require("../support/create-branch");
var wrap_node    = require("../support/wrap-node");
var update_back_refs = require("../support/update-back-refs");
var replace_node = require("../support/replace-node");
var graph_node   = require("../support/graph-node");
var update_graph  = require("../support/update-graph");

var node_as_miss = require("../support/treat-node-as-miss");
var clone_success = require("../support/clone-success-paths");

function set_path_values_as_jsong(model, pathvalues, values) {
    
    var root    = model._cache;
    var lru     = model._root;
    var expired = lru.expired;
    var version = inc_version();
    var bound   = [];
    var errors  = [];
    var reqs    = values[0].paths || (values[0].paths = []);
    var opts    = [];
    var m_reqs  = [];
    var m_opts  = [];
    var json    = values[0].jsong || (values[0].jsong = {});
    var roots   = [root, json];
    var nodes   = [root, json];
    var index   = -1;
    var count   = pathvalues.length;
    
    roots.requestedPaths = reqs;
    roots.optimizedPaths = opts;
    roots.requestedMissingPaths = m_reqs;
    roots.optimizedMissingPaths = m_opts;
    roots.errors = errors;
    roots.bound = bound;
    roots.lru   = lru;
    roots.version = version;
    roots.boxed = model._boxed || false;
    roots.expired = expired;
    roots.materialized = model._materialized || false;
    roots.errorsAsValues = model._treatErrorsAsValues || false;
    
    while(++index < count) {
        var pv = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;
        walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, bound, bound);
    }
    
    var hasValue = roots.json !== undefined;
    
    collect(lru, expired, version, root.$size || 0, model._maxSize, model._collectRatio);
    
    return {
        values: values,
        errors: errors,
        hasValue: hasValue,
        requestedPaths: reqs,
        optimizedPaths: opts,
        requestedMissingPaths: m_reqs,
        optimizedMissingPaths: m_opts
    };

}

function on_node(pathset, roots, parents, nodes, requested, optimized, key) {
    
    var parent = parents[0] = nodes[0];
    var node   = nodes[0]   = parent[key];
    
    if(pathset.length > 1) {
        nodes[0] = node = create_branch(roots, parent, node, node && node.$type || undefined, key);
        var type = node.$type;
        var json = nodes[1];
        if(json != null) {
            if(type == $path) {
                json[key] = clone(roots, node, type, node.value);
            } else if(!type) {
                parents[1] = json;
                nodes[1] = json[key] || (json[key] = {});
            }
        }
    }
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, short_circuit, key) {
    
    var type;
    var root    = roots[0];
    var parent  = parents[0];
    var node    = nodes[0];
    var size    = node && node.$size || 0;
    
    if((key = get_valid_key(null, optimized)) != null) {
        var message = roots.value;
        type = message && message.$type || undefined;
        message = wrap_node(message, type, !!type ? message.value : message);
        node = replace_node(parent, node, message, key, roots.lru);
        node = graph_node(root, parent, node, key, inc_generation());
        type = node.$type;
        
        var offset = size - node.$size;
        
        update_graph(parent, offset, roots.version, roots.lru);
    } else if(node) {
        type = node.$type;
    }
    
    if(node_as_miss(roots, node, type, pathset, requested, optimized) == false) {
        
        clone_success(roots, requested, optimized);
        
        promote(roots.lru, node);
        
        // if(key != null && !short_circuit) {
        if(key != null) {
            var json = nodes[1];
            if(json != null) {
                json[key] = clone(roots, node, type, node && node.value);
            }
        }
        
        roots.json = roots[1];
    }
}

function on_link(roots, parents, nodes, key) {
    
    var parent = parents[0] = nodes[0];
    var node   = nodes[0] = parent[key];
    var type   = node && node.$type || undefined;
    if(type == $path) {
        type = $sentinel;
    }
    nodes[0] = create_branch(roots, parent, node, type, key);
    
    var json = nodes[1];
    if(json != null) {
        nodes[1] = json[key] || (json[key] = {});
    }
}
