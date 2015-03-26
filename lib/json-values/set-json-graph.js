module.exports = set_json_graphs_as_values;

var $expires_now = 0;
var $path = "path";
var clone = require("../json-dense/clone");
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
var update_tree  = require("../support/update-tree");

var clone_success = require("../support/clone-success-paths");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");

function set_json_graphs_as_values(model, envelopes, values) {
    
    var root    = model._cache;
    var bound   = [];
    var errors  = [];
    var reqs    = [];
    var opts    = [];
    var m_reqs  = [];
    var m_opts  = [];
    var onNext  = typeof values == "function" && values || undefined;
    var roots   = [root];
    var nodes   = [root];
    var index   = -1;
    var count   = envelopes.length;
    
    roots.requestedPaths = reqs;
    roots.optimizedPaths = opts;
    roots.requestedMissingPaths = m_reqs;
    roots.optimizedMissingPaths = m_opts;
    roots.errors = errors;
    roots.bound = bound;
    roots.lru   = model._root;
    roots.version = inc_version();
    roots.values  = values;
    roots.onNext  = onNext;
    roots.boxed = model._boxed || false;
    roots.expired = model._root.expired;
    roots.materialized = model._materialized || false;
    roots.errorsAsValues = model._errorsAsValues || false;
    
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
        
    return {
        values: values,
        errors: errors,
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
    
    if(node == null) {
        return false;
    }
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, key) {
    
    var node = nodes[0];
    
    if(node_as_miss(roots, node, type, pathset, requested, optimized) == false) {
        
        clone_success(roots, requested, optimized);
        
        var type = node.$type;
        
        if(!!type && node_as_error(roots, node, type, requested) == false) {
            var pbv = {
                path: array_clone(requested),
                value: clone(roots, node, type, node.value)
            };
            var onNext = roots.onNext;
            if(onNext) {
                onNext(pbv);
            } else {
                var values = roots.values;
                if(values) {
                    values.push(pbv);
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
    
    if(node == null || is_primitive(node) || !!node.$type) {
        return false;
    }
}

if (require && require.main === module) {
    var inspect = require("util").inspect;
    var cache = require("../support/test-cache")();
    var model = require("../support/test-model")({});
    var pathsets  = [["lolomo", {to:2}, {to:2}, "item", "summary"]];
    var envelopes = [{ paths: pathsets, jsong: cache }];
    debugger;
    var values  = module.exports(model, envelopes, []);
    debugger;
    console.log(inspect(values, { depth: null }));
}