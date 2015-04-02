module.exports = set_json_graph_as_dense_json;

var $path = require("../types/$path");

var clone = require("../json-dense/clone");
var array_clone    = require("../support/array-clone");

var options = require("./options");
var walk_path_set = require("../walk/walk-path-set-soft-link");

var is_object = require("../support/is-object");

var get_valid_key = require("../support/get-valid-key");
var merge_node    = require("../support/merge-node");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");
var clone_success = require("../support/clone-success-paths");

var collect = require("../lru/collect");

function set_json_graph_as_dense_json(model, envelopes, values, error_selector) {
    
    var roots     = options([], model, error_selector);
    var index     = -1;
    var index2    = -1;
    var count     = envelopes.length;
    var nodes     = roots.nodes;
    var parents   = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json, hasValue, hasValues;
    
    roots[0]      = roots.root;
    
    while(++index < count) {
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong    = envelope.jsong || envelope.values || envelope.value;
        var index3 = -1;
        var count2 = pathsets.length;
        roots[2] = jsong;
        nodes[2] = jsong;
        while(++index3 < count2) {
            
            json = values && values[++index2];
            if(is_object(json)) {
                roots[3] = parents[3] = nodes[3] = json.json || (json.json = {});
            } else {
                roots[3] = parents[3] = nodes[3] = undefined;
            }
            
            var pathset = pathsets[index3];
            roots.index = index3;
            
            walk_path_set(onNode, onEdge, pathset, roots, parents, nodes, requested, optimized, true);
            
            hasValue = roots.hasValue;
            if(!!hasValue) {
                hasValues = true;
                if(is_object(json)) {
                    json.json = roots.json;
                }
                delete roots.json;
                delete roots.hasValue;
            } else if(is_object(json)) {
                delete json.json;
            }
        }
    }
    
    collect(
        roots.lru,
        roots.expired,
        roots.version,
        roots.root.$size || 0,
        model._maxSize,
        model._collectRatio
    );
    
    return {
        values: values,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_top_level, key, keyset, is_keyset) {
    
    var parent, messageParent;
    
    if(key == null) {
        if((key = get_valid_key(key, optimized)) == null) {
            return;
        }
        parent = parents[0];
        messageParent = parents[2];
    } else {
        parent = nodes[0];
        messageParent = nodes[2];
    }
    
    var json;
    var node = parent[key];
    var message = messageParent && messageParent[key];
    
    nodes[2] = message;
    nodes[0] = node = merge_node(roots, parent, node, messageParent, message, key);
    
    if(!is_top_level) {
        parents[0] = parent;
        parents[2] = messageParent;
        return;
    }
    
    if(pathset.length > 1) {
        parents[0] = node;
        parents[2] = message;
        if(is_keyset && !!(json = parents[3] = nodes[3])) {
            nodes[3] = json[keyset] || (json[keyset] = {});
        }
        return;
    }
    
    if(!!(json = parents[3])) {
        var type = is_object(node) && node.$type || undefined;
        var jsonkey = keyset;
        if(jsonkey == null) {
            json = roots;
            jsonkey = 3;
        }
        json[jsonkey] = clone(roots, node, type, node && node.value);
    }
}

function onEdge(pathset, roots, parents, nodes, requested, optimized, key, keyset) {
    
    var node = nodes[0];
    var type = is_object(node) && node.$type || undefined;
    
    if(node_as_miss(roots, node, type, pathset, requested, optimized) === false) {
        clone_success(roots, requested, optimized);
        if(node_as_error(roots, node, type, requested) === false) {
            roots.json = roots[3];
            roots.hasValue = true;
        }
    }
}