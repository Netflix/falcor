(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.falcor = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('operations');
},{"operations":6}],2:[function(require,module,exports){
var pathsets = require("pathsets");
var options  = require("support/json-options");
var sequence = require("walk/sequence");
var getNode  = require("get/node");
var getLink  = require("get/hard-link")(getNode);
var onError  = require("json-values/on-error");
var onEmpty  = require("pathsets/on-empty");

var getJSONNode  = require("json-dense/get-node");
var getJSONEdge  = require("json-sparse/get-edge");

var onNode   = sequence(getLink, getNode, getJSONNode);
var onEdge   = sequence(getJSONEdge, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);
},{"get/hard-link":8,"get/node":9,"json-dense/get-node":12,"json-sparse/get-edge":16,"json-values/on-error":22,"pathsets":24,"pathsets/on-empty":29,"support/json-options":30,"walk/sequence":32}],3:[function(require,module,exports){
var pathsets = require("pathsets");
var options  = require("support/json-options");
var sequence = require("walk/sequence");

var getNode  = require("get/node");
var getJSON  = require("json-graph/get-link");

var getJSONLink = sequence(getNode, getJSON);

var getLink  = require("get/soft-link")(getJSONLink);
var getEdge  = require("json-values/get-edge");
var onError  = require("json-values/on-error");
var onEmpty  = require("pathsets/on-empty");

var onNode   = sequence(getLink, getNode, getJSON);
var onEdge   = sequence(getJSON, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);
},{"get/node":9,"get/soft-link":11,"json-graph/get-link":13,"json-values/get-edge":20,"json-values/on-error":22,"pathsets":24,"pathsets/on-empty":29,"support/json-options":30,"walk/sequence":32}],4:[function(require,module,exports){
var pathsets = require("pathsets");
var options  = require("support/json-options");
var sequence = require("walk/sequence");
var getNode  = require("get/node");
var getLink  = require("get/hard-link")(getNode);
var onError  = require("json-values/on-error");
var onEmpty  = require("pathsets/on-empty");

var getJSONNode  = require("json-sparse/get-node");
var getJSONEdge  = require("json-sparse/get-edge");

var onNode   = sequence(getLink, getNode, getJSONNode);
var onEdge   = sequence(getJSONEdge, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);
},{"get/hard-link":8,"get/node":9,"json-sparse/get-edge":16,"json-sparse/get-node":17,"json-values/on-error":22,"pathsets":24,"pathsets/on-empty":29,"support/json-options":30,"walk/sequence":32}],5:[function(require,module,exports){
var pathsets = require("pathsets");
var options  = require("support/options");
var sequence = require("walk/sequence");
var getNode  = require("get/node");
var getLink  = require("get/hard-link")(getNode);
var addReq   = require("get/add-requested-key");
var onNext   = require("json-values/on-next");
var onError  = require("json-values/on-error");
var onEmpty  = require("pathsets/on-empty");

var onNode   = sequence(getLink, getNode, addReq);
var onEdge   = sequence(onNext, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);
},{"get/add-requested-key":7,"get/hard-link":8,"get/node":9,"json-values/on-error":22,"json-values/on-next":23,"pathsets":24,"pathsets/on-empty":29,"support/options":31,"walk/sequence":32}],6:[function(require,module,exports){
module.exports = {
    getPathSetsAsJSON: require("./get-pathsets-json-dense"),
    getPathSetsAsJSONG: require("./get-pathsets-json-graph"),
    getPathSetsAsPathMap: require("./get-pathsets-json-sparse"),
    getPathSetsAsValues: require("./get-pathsets-json-values")
};
},{"./get-pathsets-json-dense":2,"./get-pathsets-json-graph":3,"./get-pathsets-json-sparse":4,"./get-pathsets-json-values":5}],7:[function(require,module,exports){
module.exports = function(opts, set, depth, key, isKeySet) {
    var requestedPath = opts.requestedPath;
    requestedPath[requestedPath.length = depth] = key;
    return true;
}
},{}],8:[function(require,module,exports){
var isArray = Array.isArray;
var walk = require('walk/link');
var linkOpts = { linkIndex: 0, linkHeight: 0 };

module.exports = function(onNode) {
    return function(opts, set, depth, key, isKeySet) {
        
        var type  = opts.type;
        var value = opts.value;
        
        if(!opts.shorted && (!type || type == "sentinel") && isArray(value)) {
            
            var root = opts.root;
            var node = opts.node;
            var refs = opts.refs;
            var nodes = opts.nodes;
            var optimizedPath = opts.optimizedPath;
            
            opts.linkIndex = depth;
            linkOpts.optimizedPath = optimizedPath;
            
            do {
                var link       = value;
                var linkDepth  = 0;
                var linkHeight = link.length;
                var container  = node;
                var location   = container.__context;
                
                refs[depth] = link;
                opts.linkHeight = linkHeight;
                
                if(location != null) {
                    node = location;
                    while(linkDepth < linkHeight) {
                        optimizedPath[linkDepth] = link[linkDepth++];
                    }
                    optimizedPath.length = linkHeight;
                } else {
                    
                    node = root;
                    type  = node && node.$type || undefined;
                    value = type == "sentinel" ? node.value : node;
                    
                    linkOpts.node  = node;
                    linkOpts.type  = type;
                    linkOpts.value = value;
                    
                    linkOpts = walk(onNode, linkOpts, link);
                    
                    node = linkOpts.node;
                    
                    if(linkOpts.shorted) {
                        if(nodes) { nodes[depth - 1] = node; }
                        opts.node = node;
                        opts.shorted = true;
                        break
                    }
                    
                    if(node != null && typeof node == "object") {
                        var backRefs = node.__refs_length || 0;
                        node["__ref" + backRefs] = container;
                        node.__refs_length = backRefs + 1;
                        container.__ref_index = backRefs;
                        container.__context = node;
                    }
                }
                
                if(nodes) { nodes[depth - 1] = node; }
                
                type  = node && node.$type || undefined;
                value = type == "sentinel" ? node.value : node;
                
                opts.node  = node;
                opts.type  = type;
                opts.value = value;
                
            } while((!type || type == "sentinel") && isArray(value));
            
            delete linkOpts.opts;
            delete linkOpts.optimizedPath;
            delete linkOpts.node;
            delete linkOpts.type;
            delete linkOpts.value;
            delete linkOpts.node;
            delete linkOpts.shorted;
            
            return !opts.shorted;
        }
        
        return true;
    }
}
},{"walk/link":10}],9:[function(require,module,exports){
var isArray = Array.isArray;
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var type  = opts.type;
    var value = opts.value;
    
    if(!!type || node == null || typeof node != "object" || isArray(value)) {
        return false;
    }
    
    if(key != null) {
        
        var optimizedPath = opts.optimizedPath;
        optimizedPath[optimizedPath.length = depth + (opts.linkHeight - opts.linkIndex)] = key;
        
        node  = node[key];
        type  = node && node.$type;
        value = type == "sentinel" ? node.value : node;
        
        var nodes = opts.nodes;
        if(nodes) { nodes[depth] = node; }
        
        opts.node  = node;
        opts.type  = type;
        opts.value = value;
    }
    
    return true;
}
},{}],10:[function(require,module,exports){
module.exports = function(onNode, options, link) {
    
    options.shorted = false;
    
    var depth = 0;
    var height = link.length;
    
    while(depth < height) {
        if(onNode(options, link, depth, link[depth], false) === false) {
            options.shorted = true;
            break;
        }
        depth += 1;
    }
    
    return options;
}
},{}],11:[function(require,module,exports){
var isArray = Array.isArray;
var walk = require('walk/link');
var linkOpts = { linkIndex: 0, linkHeight: 0 };

module.exports = function(onNode) {
    return function(opts, set, depth, key, isKeySet) {
        
        var type  = opts.type;
        var value = opts.value;
        
        if(!opts.shorted && (!type || type == "sentinel") && isArray(value)) {
            
            var json;
            var jsonRoot = opts.jsonRoot;
            
            var root = opts.root;
            var node = opts.node;
            var refs = opts.refs;
            var nodes = opts.nodes;
            var jsons = opts.jsons;
            var optimizedPath = opts.optimizedPath;
            
            opts.linkIndex = depth;
            linkOpts.optimizedPath = optimizedPath;
            
            do {
                var link       = value;
                var linkDepth  = 0;
                var linkHeight = link.length;
                var container  = node;
                var location   = container.__context;
                
                refs[depth] = link;
                opts.linkHeight = linkHeight;
                
                node = root;
                type  = node && node.$type || undefined;
                value = type == "sentinel" ? node.value : node;
                
                linkOpts.json  = jsonRoot;
                linkOpts.node  = node;
                linkOpts.type  = type;
                linkOpts.value = value;
                
                linkOpts = walk(onNode, linkOpts, link);
                
                node = linkOpts.node;
                json = linkOpts.json;
                
                if(linkOpts.shorted) {
                    opts.shorted = true;
                    break;
                }
                
                if(node != null && typeof node == "object") {
                    var backRefs = node.__refs_length || 0;
                    node["__ref" + backRefs] = container;
                    node.__refs_length = backRefs + 1;
                    container.__ref_index = backRefs;
                    container.__context = node;
                }
                
                type  = node && node.$type || undefined;
                value = type == "sentinel" ? node.value : node;
                
            } while((!type || type == "sentinel") && isArray(value));
            
            if(nodes) { nodes[depth - 1] = node; }
            if(jsons) { jsons[depth - 1] = json; }
            
            opts.json  = json;
            opts.node  = node;
            opts.type  = type;
            opts.value = value;
            
            delete linkOpts.opts;
            delete linkOpts.optimizedPath;
            delete linkOpts.node;
            delete linkOpts.type;
            delete linkOpts.value;
            delete linkOpts.node;
            delete linkOpts.shorted;
            
            return !opts.shorted;
        }
        
        return true;
    }
}
},{"walk/link":10}],12:[function(require,module,exports){
var isArray = Array.isArray;
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var offset   = opts.offset;
    var jsonRoot = opts.jsonRoot || (opts.jsonRoot = opts.jsons[offset - 1]);
    
    // Only create a branch if:
    //  1. The current key is a keyset.
    //  2. The caller supplied a JSON root seed.
    //  3. The path depth is past the bound path length.
    //  4. The current node is a branch or reference.
    if(isKeySet == true && jsonRoot != null && depth >= offset) {
        
        var node  = opts.node;
        var type  = opts.type;
        var value = opts.value;
        var keysets  = opts.keysets;
        keysets[depth] = key;
        
        if((!type && node != null && typeof node == "object") || ((
            !type || type == "sentinel") && isArray(value))) {
            
            var jsons    = opts.jsons;
            var jsonKey = undefined;
            var jsonDepth = depth;
            var jsonParent, json;
            
            do {
                if (jsonKey == null) { jsonKey = keysets[jsonDepth]; }
                if ((jsonParent = jsons[--jsonDepth]) != null && (jsonKey != null)) {
                    if((json = jsonParent[jsonKey]) == null) {
                        json = jsonParent[jsonKey] = Object.create(null);
                    }
                    jsonParent = json;
                    break;
                }
            } while(jsonDepth >= offset - 2);
            
            jsons[depth] = jsonParent;
        }
    }
    return true;
}
},{}],13:[function(require,module,exports){
var isArray = Array.isArray;
var clone = require("support/clone");

module.exports = function(opts, set, depth, key, isKeySet) {
    
    var json;
    var jsons = opts.jsons;
    if(jsons) { json = jsons[depth - 1]; }
    else { json = opts.json; }
    
    var node  = opts.node;
    var type  = opts.type;
    var value = opts.value;
    
    if(key != null) {
        
        var jsonParent = json;
        
        // Create a JSONG branch, or insert the value if:
        //  1. The caller provided a JSONG root seed.
        //  2. The node is a branch or value, or materialized mode is on.
        
        if(node != null) {
            if((!type || type == "sentinel") && isArray(value)) {
                if(opts.boxed === true) {
                    json = clone(node);
                } else {
                    json = clone(value);
                }
            } else if(!type && node != null && typeof node == "object") {
                if((json = jsonParent[key]) == null) {
                    json = Object.create(null);
                } else if(typeof json !== "object") {
                    throw new Error("Fatal Falcor Error: encountered value in branch position while building JSON Graph.");
                }
            } else if(opts.materialized === true) {
                if(node == null) {
                    json = Object.create(null);
                    json["$type"] = "sentinel";
                } else if(value === undefined) {
                    json = clone(node);
                } else {
                    json = clone(value);
                }
            } else if(opts.boxed === true) {
                json = node;
            } else if(opts.errorsAsValues === true || type !== "error") {
                if(node != null) {
                    json = clone(value);
                } else {
                    json = undefined;
                }
            } else {
                json = undefined;
            }
        } else if(opts.materialized === true) {
            json = Object.create(null);
            json["$type"] = "sentinel";
        } else {
            json = undefined;
        }
        
        if(jsons) { jsons[depth] = json; }
        
        opts.json = jsonParent[key] = json;
    }
    
    return true;
}

},{"support/clone":14}],14:[function(require,module,exports){
module.exports = function(value) {
    var dest = value, src = dest, i = -1, n, key;
    if(dest != null && typeof dest === "object") {
        if(Array.isArray(src)) {
            dest = new Array(n = src.length);
            while(++i < n) { dest[i] = src[i]; }
        } else {
            dest = Object.create(null);
            for(key in src) {
                if((key[0] !== "_" || key[1] !== "_") && (key !== "/" && key !== "./" && key !== "../")) {
                    dest[key] = src[key];
                }
            }
        }
    }
    return dest;
}
},{}],15:[function(require,module,exports){
var isArray = Array.isArray;
var clone = require("support/clone");
module.exports = function(opts, node, value) {
    var json;
    if(opts.materialized === true) {
        if(node == null) {
            json = Object.create(null);
            json["$type"] = "sentinel";
        } else if(value === undefined) {
            json = clone(node);
        } else {
            json = clone(value);
            if(json != null && typeof json == "object" && !isArray(json)) {
                json["$type"] = "group";
            }
        }
    } else if(opts.boxed === true) {
        json = clone(node);
        if(node && node.$type === "sentinel") {
            json.value = clone(value);
        }
    } else if(opts.errorsAsValues || (node && node.$type != "error")) {
        if(node != null) {
            json = clone(value);
            if(json != null && typeof json == "object" && !isArray(json)) {
                json["$type"] = "group";
            }
        }
    }
    return json;
}
},{"support/clone":18}],16:[function(require,module,exports){
var isArray = Array.isArray;
var clone = require("support/clone");
var cloneJSONValue = require("./cloneJSONValue");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var offset   = opts.offset;
    var jsonRoot = opts.jsonRoot;
    
    // Only create an edge if:
    //  1. The caller supplied a JSON root seed.
    //  2. The path depth is past the bound path length.
    //  3. The current node is a branch or reference.
    if(jsonRoot != null && depth >= offset) {
        
        var node  = opts.node;
        var type  = opts.type;
        var value = opts.value;
        
        if((opts.materialized                             ) || (
            type && type != "error" || opts.errorsAsValues) || (
            node != null && typeof node !== "object"      ) || (
            isArray(value)                                  )) {
            
            opts.requestedPaths.push(clone(opts.requestedPath));
            opts.optimizedPaths.push(clone(opts.optimizedPath));
            
            var keysets  = opts.keysets;
            var jsons = opts.jsons;
            var jsonKey = undefined;
            var jsonDepth = depth;
            var jsonParent, json;
            
            do {
                if (jsonKey == null) { jsonKey = keysets[jsonDepth]; }
                if ((jsonParent = jsons[--jsonDepth]) != null && (jsonKey != null)) {
                    json = cloneJSONValue(opts, node, value);
                    if(json != null && typeof json == "object") {
                        json["__key"] = jsonKey;
                        json["__generation"] = (node["__generation"] || 0) + 1;
                    }
                    jsonParent[jsonKey] = json;
                    break;
                }
            } while(jsonDepth >= offset - 2);
            
            return false;
        }
    }
    return true;
}
},{"./cloneJSONValue":15,"support/clone":18}],17:[function(require,module,exports){
var isArray = Array.isArray;
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var offset   = opts.offset;
    var jsonRoot = opts.jsonRoot;
    
    // Only create a node if:
    //  1. The caller supplied a JSON root seed.
    //  2. The path depth is past the bound path length.
    //  3. The current node is a branch or reference.
    if(jsonRoot != null && depth >= offset) {
        
        var keysets  = opts.keysets;
        keysets[depth] = key;
        
        var node  = opts.node;
        var type  = opts.type;
        var value = opts.value;
        
        if((!type && node != null && typeof node == "object") || ((
            !type || type == "sentinel") && isArray(value))) {
            
            var jsons = opts.jsons;
            var jsonKey = undefined;
            var jsonDepth = depth;
            var jsonParent, json;
            
            do {
                if (jsonKey == null) { jsonKey = keysets[jsonDepth]; }
                if ((jsonParent = jsons[--jsonDepth]) != null && (jsonKey != null)) {
                    if((json = jsonParent[jsonKey]) == null) {
                        json = jsonParent[jsonKey] = Object.create(null);
                    } else if(typeof json !== "object") {
                        throw new Error("Fatal Falcor Error: encountered value in branch position while building Path Map.");
                    }
                    jsonParent = json;
                    break;
                }
            } while(jsonDepth >= offset - 2);
            
            jsons[depth] = jsonParent;
        }
    }
    return true;
}
},{}],18:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"dup":14}],19:[function(require,module,exports){
var clone = require("support/clone");
module.exports = function(opts, node, value, path) {
    var val = { path: path.slice(0) };
    if(opts.materialized === true) {
        if(node == null) {
            val.value = Object.create(null);
            val.value["$type"] = "sentinel";
        } else if(value === undefined) {
            val.value = clone(node);
        } else {
            val.value = clone(value);
        }
    } else if(opts.boxed === true) {
        val.value = clone(node);
        if(node && node.$type === "sentinel") {
            val.value.value = clone(value);
        }
    } else {
        val.value = clone(value);
    }
    return val;
}
},{"support/clone":21}],20:[function(require,module,exports){
var isArray = Array.isArray;
var clone = require("support/clone");
var clonePathValue = require("./clonePathValue");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var nodes = opts.nodes;
    var node  = nodes[depth - 1];
    
    var init  = false;
    var nodes = opts.nodes;
    var node  = nodes[depth - 1];
    var type  = node && node.$type || undefined;
    var value = type === "sentinel" ? node.value : node;
    
    do {
        if(!!type || node == null || typeof node != "object" || isArray(value)) {
            nodes[depth] = node;
            break;
        } else if(key != null) {
            var optimizedPath = opts.optimizedPath;
            optimizedPath[optimizedPath.length = depth + (opts.linkHeight - opts.linkIndex)] = key;
            node = node[key];
            type  = node && node.$type || undefined;
            value = type === "sentinel" ? node.value : node;
        }
        
        if(init = !init) {
            var requestedPath = opts.requestedPath;
            requestedPath[requestedPath.length = depth] = key;
            continue;
        }
        
        throw new Error("Can only request for edge values.");
        return false;
    } while(true);
    
    return true;
}
},{"./clonePathValue":19,"support/clone":21}],21:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"dup":14}],22:[function(require,module,exports){
module.exports = function() {
    return true;
}
},{}],23:[function(require,module,exports){
var isArray = Array.isArray;
var clone = require("support/clone");
var clonePathValue = require("./clonePathValue");
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var node  = opts.node;
    var type  = opts.type;
    var value = opts.value;
    
    if((opts.materialized                             ) || (
        type && type != "error" || opts.errorsAsValues) || (
        node != null && typeof node !== "object"      ) || (
        isArray(value)                                  )) {
        
        opts.requestedPaths.push(clone(opts.requestedPath));
        opts.optimizedPaths.push(clone(opts.optimizedPath));
        
        var onNext = opts.onNext, values = opts.values;
        
        if(onNext) {
            onNext(clonePathValue(opts, node, value, opts.requestedPath));
        } else if(values) {
            values.push(clonePathValue(opts, node, value, opts.requestedPath));
        }
        
        return false;
    }
    
    return true;
}
},{"./clonePathValue":19,"support/clone":21}],24:[function(require,module,exports){
var walk = require("walk/pathset");

module.exports = function(options, onNode, onEdge) {
    
    return function(model, pathsets, values) {
        
        var opts  = options(model, values);
        var index = -1;
        var count = pathsets.length;
        
        while(++index < count) {
            opts.index = index;
            opts = walk(onNode, onEdge, opts, pathsets[index]);
        }
        
        return opts;
    };
};
},{"walk/pathset":27}],25:[function(require,module,exports){
module.exports = fromKeySet;

var __OFFSET = "__offset";
var isArray = Array.isArray;

function fromKeySet(key, isKeySet) {
    if(isKeySet) {
        if(isArray(key)) {
            key = key[key[__OFFSET] || (key[__OFFSET] = 0)];
            return fromKeySet(key, key != null && typeof key === "object");
        } else {
            if(key[__OFFSET] === undefined) {
                key[__OFFSET] = key.from || (key.from = 0);
            }
            return key[__OFFSET];
        }
    }
    return key;
}


},{}],26:[function(require,module,exports){
module.exports = function(opts, depth) {
    
    var requestedPath = opts.requestedPath;
    var optimizedPath = opts.optimizedPath;
    var ref = linkIndex = linkHeight = depth;
    var refs = opts.refs;
    
    refs.length = depth + 1;
    
    while(linkIndex >= -1) {
        if(!!(ref = refs[linkIndex])) {
            ~linkIndex || ++linkIndex;
            linkHeight = ref.length;
            var i = 0, j = 0;
            while(i < linkHeight) {
                optimizedPath[j++] = ref[i++];
            }
            i = linkIndex;
            while(i < depth) {
                optimizedPath[j++] = requestedPath[i++];
            }
            requestedPath.length = i;
            optimizedPath.length = j;
            break;
        }
        --linkIndex;
    }
    
    var nodes = opts.nodes;
    var node  = nodes[depth - 1];
    var type  = node && node.$type || undefined;
    var value = type == "sentinel" ? node.value : value;
    
    opts.node  = node;
    opts.type  = type;
    opts.value = value;
    
    opts.linkIndex = linkIndex;
    opts.linkHeight = linkHeight;
    
    return opts;
}
},{}],27:[function(require,module,exports){
var hydrateKeys = require('./hydrateKeys');
var fromKeySet = require('./fromKeySet');
var permuteKey = require('./permuteKey');

module.exports = function(onNode, onEdge, options, pathset) {
    
    var depth = 0;
    var height = pathset.length;
    var outerKey, isKeySet, innerKey;
    
    while(depth > -1) {
        
        options.shorted = false;
        options = hydrateKeys(options, depth);
        
        walk: do {
            
            outerKey = pathset[depth];
            isKeySet = outerKey != null && typeof outerKey === "object";
            innerKey = fromKeySet(outerKey, isKeySet);
            
            while(depth < height || (--depth && false)) {
                if(!onNode(options, pathset, depth, innerKey, isKeySet)) {
                    break;
                }
                depth += 1;
                continue walk;
            }
            
            onEdge(options, pathset, depth, innerKey, isKeySet);
            
            break walk;
        } while(true);
        
        while(depth > -1 && permuteKey(pathset[depth])) {
            depth -= 1;
        }
    }
    
    return options;
}
},{"./fromKeySet":25,"./hydrateKeys":26,"./permuteKey":28}],28:[function(require,module,exports){
module.exports = permuteKey;

var __OFFSET = "__offset";
var isArray = Array.isArray;

function permuteKey(key) {
    if(isArray(key)) {
        if(++key[__OFFSET] === key.length) {
            return _permuteKeySet(key[key[__OFFSET] = 0]);
        } else {
            return false;
        }
    } else if(typeof key === "object") {
        if(++key[__OFFSET] > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
            key[__OFFSET] = key.from;
            return true;
        }
        return false;
    }
    return true;
}
},{}],29:[function(require,module,exports){
module.exports = function(opts, set, depth, key, isKeySet) {
    
    var boundPath = opts.refs[-1];
    var requestedPath = opts.requestedPath;
    var optimizedPath = opts.optimizedPath;
    var requestedMissingPaths = opts.requestedMissingPaths;
    var optimizedMissingPaths = opts.optimizedMissingPaths;
    
    var i = -1, j = -1, l = 0,
        height = set.length,
        n = boundPath.length,
        k = requestedPath.length,
        m, x, y, req = [];
    
    while(++i < n) { req[i] = boundPath[i]; }
    while(++j < k) {
        x = requestedPath[j];
        if(typeof (y = set[l++]) === "object") {
            req[i++] = [x];
        } else {
            req[i++] = x;
        }
    }
    
    m = n + l + height - depth;
    
    while(i < m) { req[i++] = set[l++]; }
    
    req.length = i;
    req.pathSetIndex = opts.index;
    requestedMissingPaths[requestedMissingPaths.length] = req;
    
    i = -1;
    n = optimizedPath.length;
    
    var opt = new Array(n + height - depth);
    
    while(++i < n) { opt[i] = optimizedPath[i]; }
    for(j = depth, n = height; j < n;) {
        if((x = set[j++]) || x != null) {
            opt[i++] = x;
        }
    }
    
    opt.length = i;
    optimizedMissingPaths[optimizedMissingPaths.length] = opt;
    
    return true;
}
},{}],30:[function(require,module,exports){
var options = require("./options");
module.exports = function(model, values) {
    var opts = options(model, values);
    opts.jsons = [];
    opts.keysets = [];
    opts.jsons[-1] = opts.jsonRoot = values && values[0];
    opts.offset = 0;
    return opts;
}
},{"./options":31}],31:[function(require,module,exports){
module.exports = function(model, values) {
    
    var root = model._cache;
    var node = model._cache;
    var type = node && node.$type || undefined;
    var value = type == "sentinel" ? node.value : node;
    var refs = [];
    var nodes = [];
    var errors = [];
    var requestedPath = [];
    var optimizedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var requestedMissingPaths = [];
    var optimizedMissingPaths = [];
    
    refs[-1] = model._path;
    nodes[-2] = root;
    nodes[-1] = node;
    
    return {
        
        root: root,
        node: node,
        type: type,
        value: value,
        
        lru: model._root,
        boxed: model._boxed,
        expired: model._root.expired,
        materialized: model._materialized,
        errorsAsValues: model._errorsAsValues,
        
        refs: refs,
        nodes: nodes,
        errors: errors,
        shorted: false,
        linkIndex: 0,
        linkHeight: 0,
        requestedPath: requestedPath,
        optimizedPath: optimizedPath,
        requestedPaths: requestedPaths,
        optimizedPaths: optimizedPaths,
        requestedMissingPaths: requestedMissingPaths,
        optimizedMissingPaths: optimizedMissingPaths,
        values: typeof values === "object" && values || undefined,
        onNext: typeof values === "function" && values || undefined,
    };
}
},{}],32:[function(require,module,exports){
module.exports = function() {
    var argsIdx = -1;
    var argsLen = arguments.length;
    var functions = new Array(argsLen);
    while(++argsIdx < argsLen) {
        functions[argsIdx] = arguments[argsIdx];
    }
    return function(options, set, depth, key, isKeySet) {
        var index = -1;
        while(++index < argsLen) {
            if(functions[index](options, set, depth, key, isKeySet) === false) {
                return false;
            }
        }
        return true;
    }
}
},{}]},{},[1])(1)
});