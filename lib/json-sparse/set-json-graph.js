module.exports = set_json_graphs_as_pathmap;

var $path = require("../types/$path");

// var clone = require("../json-dense/clone");
var clone = require("./clone");

var promote = require("../lru/promote");
var collect = require("../lru/collect");

var walk_pathset = require("../json-dense/walk-path-set-soft-link");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");
var array_clone  = require("../support/array-clone");

var inc_version  = require("../support/inc-version");
var inc_generation = require("../support/inc-generation");

var wrap_node    = require("../support/wrap-node");
var merge_node    = require("../support/merge-node");
var update_back_refs = require("../support/update-back-refs");
var replace_node = require("../support/replace-node");
var graph_node   = require("../support/graph-node");
var update_graph  = require("../support/update-graph");

var clone_success = require("../support/clone-success-paths");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");

function set_json_graphs_as_pathmap(model, envelopes, values) {
    
    var root    = model._cache;
    var lru     = model._root;
    var expired = lru.expired;
    var version = inc_version();
    var bound   = [];
    var errors  = [];
    var reqs    = [];
    var opts    = [];
    var m_reqs  = [];
    var m_opts  = [];
    var json    = values[0].json = {};
    var roots   = [root, json];
    var nodes   = [root, json];
    var index   = -1;
    var count   = envelopes.length;
    
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
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong    = envelope.jsong || envelope.values || envelope.value;
        var index2 = -1;
        var count2 = pathsets.length;
        roots[2] = jsong;
        nodes[2] = jsong;
        while(++index2 < count2) {
            var pathset = pathsets[index2];
            roots.index = index2;
            walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, bound, bound);
        }
    }
    
    var hasValue = (values[0].json = roots.json) !== undefined;
    
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
    
    var parent        = parents[0] = nodes[0];
    var messageParent = parents[2] = nodes[2];
    var node    = nodes[0] = parent[key];
    var message = nodes[2] = messageParent && messageParent[key];
    
    node = nodes[0] = merge_node(roots, parent, node, messageParent, message, key);
    
    if(pathset.length > 1 && is_object(node)) {
        var type = node.$type;
        if(!type || type == $path) {
            var json = nodes[1];
            if(json != null) {
                parents[1] = json;
                nodes[1] = json[key] || (json[key] = {});
            }
        }
    }
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, short_circuit, key) {
    
    var node = nodes[0];
    var type = node && node.$type || undefined;
    
    if(node_as_miss(roots, node, type, pathset, requested, optimized) == false) {
        
        clone_success(roots, requested, optimized);
        
        if(node_as_error(roots, node, type, requested) == false) {
            promote(roots.lru, node);
            if(key != null) {
                // var json = nodes[1];
                var json = short_circuit && parents[1] || nodes[1];
                if(json != null) {
                    json[key] = clone(roots, node, type, node && node.value);
                    roots.json = roots[1];
                }
            }
        }
    }
}

function on_link(roots, nodes, key) {
    
    var parent        = nodes[0];
    var messageParent = nodes[2];
    var node    = nodes[0] = parent[key];
    var message = nodes[2] = messageParent && messageParent[key];
    
    node = nodes[0] = merge_node(roots, parent, node, messageParent, message, key);
}
