module.exports = set_path_values_as_jsong;

var $path = "path";
var clone = require("./clone");
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

function set_path_values_as_jsong(model, pathvalues, values) {
    
    var root    = model._cache;
    var bound   = [];
    var json    = values && values[0];
    var roots   = [root, json];
    var nodes   = [root, json];
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
        var pv = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;
        walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, bound, bound);
    }
    values && (values[0] = roots.json);
    return values;
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
        
        var json = nodes[1];
        
        if(json != null) {
            if(!type) {
                parents[1] = json;
                nodes[1] = json[key] || (json[key] = {});
            } else {
                json[key] = { $type: $path, value: node.value };
            }
        }
    }
}

function on_edge(pathset, roots, parents, nodes, requested, optimized, key) {
    
    if(key == null) { return; }
    
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
    
    var json = nodes[1];
    
    if(json != null) {
        json[key] = clone(roots, node, type, value);
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
        
        node = replace_node(parent, node, {}, key, roots.lru);
        node = graph_node(root, parent, node, key, 0);
        node = update_back_refs(node, roots.version);
        nodes[0] = node;
        type = undefined;
    }
    
    var json = nodes[1];
    if(json != null) {
        nodes[1] = json[key] || (json[key] = {});
    }
}
