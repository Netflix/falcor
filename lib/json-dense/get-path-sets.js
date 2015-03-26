module.exports = get_pathsets_as_json;

var $path = "path";
var clone = require("./clone");
var walk_pathset = require("./walk-path-set");
var is_object    = require("../support/is-object");
var is_primitive = require("../support/is-primitive");
var array_clone  = require("../support/array-clone");

var clone_success = require("../support/clone-success-paths");

var node_as_miss = require("../support/treat-node-as-miss");
var node_as_error = require("../support/treat-node-as-error");

function get_pathsets_as_json(model, pathsets, values) {
    
    var root    = model._cache;
    var bound   = model._path;
    var errors  = [];
    var reqs    = [];
    var opts    = [];
    var m_reqs  = [];
    var m_opts  = [];
    var roots   = [root];
    var nodes   = [root];
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
    roots.errorsAsValues = model._errorsAsValues || false;
    
    while(++index < count) {
        
        var pathset = pathsets[index];
        var json    = values && values[index];
        
        roots[1]    = json;
        nodes[1]    = json;
        roots.index = index;
        
        walk_pathset(on_node, on_edge, on_link, pathset, roots, nodes, nodes, [], bound);
        
        if(values) {
            json = roots.json;
            if(json === undefined) {
                values[index] = undefined;
            } else {
                values[index] = { json: json };
                delete roots.json;
            }
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

function on_node(pathset, roots, parents, nodes, requested, optimized, key, iskeyset, keyset) {
    
    var node = parents[0] = nodes[0];
    node = nodes[0] = node[key];
    
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
    
    if(node_as_miss(roots, node, type, pathset, requested, optimized) == false) {
        
        clone_success(roots, requested, optimized);
        
        var type = node && node.$type || undefined;
        
        if(!!type && node_as_error(roots, node, type, requested) == false) {
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
    var node = nodes[0];
    node = nodes[0] = node[key];
}

if (require && require.main === module) {
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
    debugger;
    var values  = module.exports(model, pathsets, [{}, {}, {}, {}]);
    debugger;
    console.log(inspect(values, { depth: null }));
}