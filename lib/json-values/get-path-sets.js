module.exports = get_pathsets_as_values;

var $path = require("../types/$path");
var $error = require("../types/$error");

var clone = require("../json-dense/clone");

var promote = require("../lru/promote");

var walk_pathset = require("../json-dense/walk-path-set");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");
var array_clone  = require("../support/array-clone");

var clone_success = require("../support/clone-success-paths");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");

var getBoundValue = require('../../operations/alt-sentinel/get/getBoundValue');

function get_pathsets_as_values(model, pathsets, onNext) {
    
    var root    = model._cache;
    var bound   = model._path;
    var errors  = [];
    var reqs    = [];
    var opts    = [];
    var m_reqs  = [];
    var m_opts  = [];
    var roots   = [root];
    var nodes   = [bound.length ? getBoundValue(model, bound).value : root];
    var index   = -1;
    var count   = pathsets.length;
    
    roots.requestedPaths = reqs;
    roots.optimizedPaths = opts;
    roots.requestedMissingPaths = m_reqs;
    roots.optimizedMissingPaths = m_opts;
    roots.errors = errors;
    roots.onNext  = typeof onNext == "function" && onNext || undefined;
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
        
    return {
        values: null,
        errors: errors,
        requestedPaths: reqs,
        optimizedPaths: opts,
        requestedMissingPaths: m_reqs,
        optimizedMissingPaths: m_opts
    };

}

function on_node(pathset, roots, parents, nodes, requested, optimized, key) {
    var node = parents[0] = nodes[0];
    node = nodes[0] = node[key];
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, short_circuit, key) {
    
    var node = nodes[0];
    var type = node && node.$type || undefined;
    
    if(node_as_miss(roots, node, type, pathset, requested, optimized) == false) {
        
        clone_success(roots, requested, optimized);
        
        if(node_as_error(roots, node, type, requested) == false) {
            promote(roots.lru, node);
            var pbv = {
                path: array_clone(requested),
                value: clone(roots, node, type, node && node.value)
            };
            var onNext = roots.onNext;
            if(onNext) {
                onNext(pbv);
            }
        }
    }
}

function on_link(roots, parents, nodes, key) {
    var node = parents[0] = nodes[0];
    nodes[0] = node[key];
}
