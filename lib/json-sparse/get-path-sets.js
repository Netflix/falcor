module.exports = get_pathsets_as_pathmap;

var $path = require("../types/$path");

// var clone = require("../json-dense/clone");
var clone = require("./clone");

var promote = require("../lru/promote");

var walk_pathset = require("../json-dense/walk-path-set");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");
var array_clone  = require("../support/array-clone");

var clone_success = require("../support/clone-success-paths");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");

var getBoundValue = require('../../operations/alt-sentinel/get/getBoundValue');

function get_pathsets_as_pathmap(model, pathsets, values) {
    
    var root = model._cache;
    var bound   = model._path;
    var errors  = [];
    var reqs    = [];
    var opts    = [];
    var m_reqs  = [];
    var m_opts  = [];
    var json    = values[0].json = {};
    var roots   = [root, json];
    var nodes   = [bound.length ? getBoundValue(model, bound).value : root, json];
    var index   = -1;
    var count   = pathsets.length;
    
    roots.requestedPaths = reqs;
    roots.optimizedPaths = opts;
    roots.requestedMissingPaths = m_reqs;
    roots.optimizedMissingPaths = m_opts;
    roots.errors = errors;
    roots.bound = bound;
    roots.lru   = model._root;
    roots.boxed = model._boxed || false;
    roots.expired = model._root.expired;
    roots.materialized = model._materialized || false;
    roots.errorsAsValues = model._treatErrorsAsValues || false;
    
    while(++index < count) {
        var pathset = pathsets[index];
        roots.index = index;
        walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, [], bound);
    }
    
    var hasValue = (values[0].json = roots.json) !== undefined;
    
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
    
    var node = parents[0] = nodes[0];
    node = nodes[0] = node[key];
    
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
    var node = nodes[0];
    node = nodes[0] = node[key];
}
