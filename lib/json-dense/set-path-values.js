module.exports = set_path_values_as_json;

var $path = "path";

var walk_pathset = require("./walk-path-set");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");

var inc_version  = require("../support/inc-version");
var inc_generation = require("../support/inc-generation");

var wrap_node    = require("../support/wrap-node");
var update_back_refs = require("../support/update-back-refs");
var replace_node = require("../support/replace-node");
var graph_node   = require("../support/graph-node");
var update_tree  = require("../support/update-tree");

function set_path_values_as_json(model, pathvalues, values) {
    
    var root    = model._cache;
    var bound   = [];
    var roots   = [root];
    var nodes   = [root];
    var index   = -1;
    var count   = pathvalues.length;
    
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
        
        var pv      = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;
        
        var json    = values && values[index];
        roots[1]    = json;
        nodes[1]    = json;
        
        walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, bound, bound);
        
        values && (values[index] = roots.json);
        
        delete roots.json;
    }
    return values;
}

function on_node(pathset, roots, parents, nodes, requested, optimized, key, iskeyset, keyset) {
    
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
        
        var json = nodes[1];
        if(json != null && iskeyset == true && (!type || type == $path)) {
            parents[1] = json;
            nodes[1]   = json[keyset] || (json[keyset] = {});
        }
    }
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, key, iskeyset, keyset) {
    
    var root    = roots[0];
    var parent  = parents[0];
    var node    = nodes[0];
    var size    = node && node.$size || 0;
    
    var message = roots.value;
    var type    = message && message.$type || undefined;
    var value   = !!type ? message.value : message;
    
    message = wrap_node(message, type, value);
    
    node = replace_node(parent, node, message, key, roots.lru);
    node = graph_node(root, parent, node, key, inc_generation());
    type = node.$type;
    
    var offset = size - node.$size;
    
    update_tree(parent, offset, roots.version, roots.lru);
    
    var json = parents[1];
    if(json != null) {
        var jsonkey = keyset;
        if(jsonkey == null) {
            json = roots;
            jsonkey = 1;
        }
        json[jsonkey] = value;
        roots.json = roots[1];
    }
}

function on_link(roots, nodes, key) {
    
    var parent = nodes[0];
    var node   = nodes[0] = parent[key];
    var type = node && node.$type || undefined;
    
    if(!!type || is_primitive(node)) {
        
        var root = roots[0];
        var parent = parents[0];
        
        node = replace_node(roots.lru, parent, node, {}, key);
        node = graph_node(root, parent, node, key, 0);
        node = update_back_refs(node, roots.version);
        nodes[0] = node;
        type = undefined;
    }
}

/*
var inspect = require("util").inspect;
var cache = require("../support/test-cache")();
var model = require("../support/test-model")(cache);
var values  = set_path_values_as_json(model, [{
    path: ["lolomo", {to: 4}, {to:4}, "item", "summary"],
    value: "new summary"
}], [{}]);

debugger;

console.log(inspect(values, { depth: null }));
console.log(inspect(cache.videos["012"].summary, { depth: 0 }));
*/