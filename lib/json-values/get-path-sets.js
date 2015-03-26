module.exports = get_pathsets_as_values;

var $path = "path";
var clone = require("./clone");
var walk_pathset = require("../json-sparse/walk-path-set");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");
var array_clone  = require("../support/array-clone");
var clone_requested_path = require("../support/clone-requested-path");
var clone_optimized_path = require("../support/clone-optimized-path");

function get_pathsets_as_values(model, pathsets, values) {
    
    var root    = model._cache;
    var bound   = model._path;
    var errors  = [];
    var onNext  = typeof values == "function" && values || undefined;
    var roots   = [root];
    var nodes   = [root];
    var index   = -1;
    var count   = pathsets.length;
    
    roots.r = [];
    roots.o = [];
    roots.reqs = [];
    roots.opts = [];
    roots.values  = values;
    roots.onNext  = onNext;
    roots.bound = bound;
    roots.boxed = model._boxed || false;
    roots.expired = model._root.expired;
    roots.materialized = model._materialized || false;
    roots.errorsAsValues = model._errorsAsValues || false;
    
    while(++index < count) {
        var pathset = pathsets[index];
        roots.index = index;
        walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, [], bound);
    }
        
    return {
        values: values,
        errors: errors,
        requestedPaths: roots.r,
        optimizedPaths: roots.o,
        requestedMissingPaths: roots.reqs,
        optimizedMissingPaths: roots.opts
    };

}

function on_node(pathset, roots, parents, nodes, requested, optimized, key) {
    var node = parents[0] = nodes[0];
    node = nodes[0] = node[key];
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, key) {
    
    var node = nodes[0];
    
    if(node == null) {
        var reqs = roots.reqs;
        var opts = roots.opts;
        reqs[reqs.length] = clone_requested_path(roots.bound, requested, pathset, roots.index);
        opts[opts.length] = clone_optimized_path(optimized, pathset);
    } else {
        var reqs = roots.r;
        var opts = roots.o;
        reqs[reqs.length] = array_clone(requested);
        opts[opts.length] = array_clone(optimized);
        
        var type = node.$type;
        if(!!type) {
            var onNext = roots.onNext, values;
            if(onNext) {
                onNext(clone(roots, node, node.value, requested));
            } else if(values = roots.values) {
                values.push(clone(roots, node, node.value, requested));
            }
        }
    }
}

function on_link(roots, nodes, key) {
    var node = nodes[0];
    node = nodes[0] = node[key];
}

/*
var inspect = require("util").inspect;
// var cache = require("../support/test-cache")();
var cache = require("../support/test-cache-2")();
var model = require("../support/test-model")(cache);
var pathsets = [
    ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
    ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
    ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
    ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
];
var values  = get_pathsets_as_values(model, pathsets, []);

debugger;

console.log(inspect(values, { depth: null }));
*/