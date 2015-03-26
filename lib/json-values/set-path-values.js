module.exports = set_path_values_as_values;

var $path = "path";
var clone = require("../json-dense/clone");
var walk_pathset = require("../json-dense/walk-path-set");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");
var array_clone  = require("../support/array-clone");

var inc_version  = require("../support/inc-version");
var inc_generation = require("../support/inc-generation");

var wrap_node    = require("../support/wrap-node");
var update_back_refs = require("../support/update-back-refs");
var replace_node = require("../support/replace-node");
var graph_node   = require("../support/graph-node");
var update_graph  = require("../support/update-graph");

var clone_success = require("../support/clone-success-paths");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");

function set_path_values_as_values(model, pathvalues, values) {
    
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
    var count   = pathvalues.length;
    
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
    roots.errorsAsValues = model._treatErrorsAsValues || false;
    
    while(++index < count) {
        var pv      = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;
        walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, bound, bound);
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
    
    var parent = parents[0] = nodes[0];
    var node   = nodes[0]   = parent[key];
    
    if(pathset.length > 1) {
        var type = node && node.$type || undefined;
        if((!!type && type != $path) || is_primitive(node)) {
            
            var root = roots[0];
            
            node = replace_node(parent, node, {}, key, roots.lru);
            node = graph_node(root, parent, node, key, 0);
            node = update_back_refs(node, roots.version);
            nodes[0] = node;
            type = undefined;
        }
    }
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, short_circuit, key) {
    
    var type;
    var root    = roots[0];
    var parent  = parents[0];
    var node    = nodes[0];
    var size    = node && node.$size || 0;
    
    if(key != null) {
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
        
        if(node_as_error(roots, node, type, requested) == false) {
            var pbv = {
                path: array_clone(requested),
                value: clone(roots, node, type, node && node.value)
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
    
    var parent = nodes[0];
    var node   = nodes[0] = parent[key];
    var type = node && node.$type || undefined;
    
    if(!!type || is_primitive(node)) {
        
        var root = roots[0];
        var parent = parents[0];
        
        node = replace_node(parent, node, {}, key, roots.lru);
        node = graph_node(root, parent, node, key, 0);
        node = update_back_refs(node, roots.version);
        nodes[0] = node;
    }
}

if (require && require.main === module) {
    var inspect = require("util").inspect;
    var cache = require("../support/test-cache")();
    var model = require("../support/test-model")(cache);
    var pathvalues = [{
        path: ["lolomo", {to:2}, {to:2}, "item", "summary"],
        value: "new summary"
    }];
    debugger;
    var values  = module.exports(model, pathvalues, []);
    debugger;
    console.log(inspect(values, { depth: null }));
}