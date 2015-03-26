module.exports = get_pathsets_as_jsong;

var $path = "path";
var clone = require("./clone");
var walk_pathset = require("./walk-path-set");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");
var clone_requested_path = require("../support/clone-requested-path");
var clone_optimized_path = require("../support/clone-optimized-path");

function get_pathsets_as_jsong(model, pathsets, values) {
    
    var root    = model._cache;
    var bound   = [];
    var json    = values && values[0];
    var roots   = [root, json];
    var nodes   = [root, json];
    var index   = -1;
    var count   = pathsets.length;
    
    roots.reqs = [];
    roots.opts = [];
    roots.bound = bound;
    roots.boxed = model._boxed || false;
    roots.expired = model._root.expired;
    roots.materialized = model._materialized || false;
    roots.errorsAsValues = model._errorsAsValues || false;
    
    while(++index < count) {
        var pathset = pathsets[index];
        roots.index = index;
        walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, bound, bound);
    }
    values && (values[0] = roots.json);
    return values;
}

function on_node(pathset, roots, parents, nodes, requested, optimized, key) {
    
    var node = parents[0] = nodes[0];
    node = nodes[0] = node[key];
    
    if(pathset.length > 1 && is_object(node)) {
        var json = nodes[1];
        if(json != null) {
            var type = node.$type;
            if(!type) {
                parents[1] = json;
                nodes[1] = json[key] || (json[key] = {});
            } else {
                json[key] = clone(roots, node, type, node.value);
            }
        }
    }
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, key) {
    
    var node = nodes[0];
    
    if(node == null) {
        var reqs = roots.reqs;
        var opts = roots.opts;
        reqs[reqs.length] = clone_requested_path(roots.bound, requested, pathset, roots.index);
        opts[opts.length] = clone_optimized_path(optimized, pathset);
    } else if(key != null) {
        var type = node.$type;
        if(!!type) {
            var json = nodes[1];
            if(json != null) {
                json[key] = clone(roots, node, type, node.value);
                roots.json = roots[1];
            }
        }
    }
}

function on_link(roots, nodes, key) {
    var node = nodes[0];
    node = nodes[0] = node[key];
    if(is_object(node)) {
        var json = nodes[1];
        if(json != null) {
            var type = node.$type;
            if(!type) {
                nodes[1] = json[key] || (json[key] = {});
            } else {
                json[key] = clone(roots, node, type, node.value);
            }
        }
    }
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
var values  = get_pathsets_as_jsong(model, pathsets, [{}]);

debugger;

console.log(inspect(values, { depth: null }));
*/