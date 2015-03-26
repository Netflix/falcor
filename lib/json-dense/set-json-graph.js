module.exports = set_json_graphs_as_json;

var $expires_now = 0;
var $path = "path";
var clone = require("./clone");
var walk_pathset = require("./walk-path-set-soft-link");
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

function set_json_graphs_as_json(model, envelopes, values) {
    
    var root    = model._cache;
    var bound   = [];
    var json    = values && values[0];
    var roots   = [root, json];
    var nodes   = [root, json];
    var index   = -1;
    var count   = envelopes.length;
    
    roots.reqs = [];
    roots.opts = [];
    roots.bound = bound;
    roots.lru   = model._root;
    roots.version = inc_version();
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
    values && (values[0] = roots.json);
    return values;
}

function on_node(pathset, roots, parents, nodes, requested, optimized, key, iskeyset, keyset) {
    
    var parent        = parents[0] = nodes[0];
    var messageParent = parents[2] = nodes[2];
    var node    = nodes[0] = parent[key];
    var message = nodes[2] = messageParent && messageParent[key];
    
    node = nodes[0] = merge_node(roots, parent, node, messageParent, message, key);
    
    if(iskeyset == true && pathset.length > 1 && is_object(node)) {
        var json = nodes[1];
        if(json != null) {
            var type = node.$type;
            if(!type || type == $path) {
                parents[1] = json;
                nodes[1]   = json[keyset] || (json[keyset] = {});
            }
        }
    }
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, key, iskeyset, keyset) {
    
    var node = nodes[0];
    
    if(node == null) {
        var reqs = roots.reqs;
        var opts = roots.opts;
        reqs[reqs.length] = clone_requested_path(roots.bound, requested, pathset, roots.index);
        opts[opts.length] = clone_optimized_path(optimized, pathset);
    } else {
        var type = node.$type;
        if(!!type) {
            var json = parents[1];
            if(json != null) {
                var jsonkey = keyset;
                if(jsonkey == null) {
                    json = roots;
                    jsonkey = 1;
                }
                json[jsonkey] = clone(roots, node, type, node.value);
                roots.json = roots[1];
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

/*
var inspect = require("util").inspect;
var cache = require("../support/test-cache")();
var model = require("../support/test-model")({});
var pathsets  = [["lolomo", {to: 4}, {to:4}, "item", "summary"]];
var envelopes = [{ paths: pathsets, jsong: cache }];

debugger;

var values  = set_json_graphs_as_json(model, envelopes, [{}]);

debugger;

console.log(inspect(values, { depth: null }));
console.log(inspect(cache.videos["012"].summary, { depth: 0 }));
*/