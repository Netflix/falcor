var isArray = Array.isArray;
// var inspect = require("util").inspect;

module.exports = {
    get: get_pathset_sync,
    onNode: onNode,
    onEdge: onEdge,
    onLink: onLink
};

// execute();

function get_pathset_sync(onNode, onLink, onEdge, rest, roots, parents, nodes, values, requested, optimized, key, keyset) {
    
    var outerkey, iskeyset, innerkey, type, value, ref, back, node = nodes[0];
    
    if(rest.length == 0 || node == null || typeof node != "object") {
        return onEdge(parents, nodes, values, key, keyset, requested, optimized);
    } else if((type = node.$type) == "reference") {
        do {
            ref   = node;
            value = node.value;
            node  = node.__context;
            if(node != null) {
                type = node.$type;
                optimized = clone_array(value);
                nodes[0] = node;
            } else {
                optimized.length = 0;
                nodes = get_reference_sync(onLink, value, clone_array(roots), clone_array(nodes), optimized);
                optimized = nodes.path;
                nodes = nodes.nodes;
                node  = nodes[0];
                if(node != null && typeof node == "object") {
                    type = node.$type;
                    back = node.__refs_length || 0;
                    node.__refs_length = back + 1;
                    node["__ref" + back] = ref;
                    ref.__context = node;
                    ref.__ref_index = back;
                } else {
                    return onEdge(parents, nodes, values, key, keyset, requested, optimized);
                }
            }
        } while(type == "reference");
    }
    
    if(!!type) {
        return onEdge(parents, nodes, values, key, keyset, requested, optimized);
    }
    
    outerkey = rest[0];
    iskeyset = outerkey != null && typeof outerkey == "object";
    
    do {
        var parents2 = clone_array(parents);
        var nodes2   = clone_array(nodes);
        
        innerkey = !iskeyset ? outerkey : fromKeySet(outerkey, iskeyset);
        
        if(onNode(parents2, nodes2, innerkey, iskeyset) !== false) {
            get_pathset_sync(
                onNode, onLink, onEdge,
                slice_array(rest, 1),
                roots, parents2, nodes2, values,
                concat_array(requested, innerkey),
                concat_array(optimized, innerkey),
                innerkey, iskeyset
            );
        } else {
            onEdge(parents2, nodes2, values, innerkey, iskeyset, requested, optimized);
        }
    } while(iskeyset && !permuteKey(outerkey));
}

function get_value_sync(onLink, rest, roots, nodes, path) {
    
    var key, type, value, ref, back, node = nodes[0], pbv;
    
    if(rest.length == 0 || node == null || typeof node != "object") {
        // pbv = Object.create(null);
        pbv = {};
        pbv.path = path;
        if(type = node && node.$type) {
            pbv.value = node.value;
            return { path: path, value: node.value };
        } else {
            pbv.value = node;
        }
        return pbv;
    } else if((type = node.$type) == "reference") {
        do {
            ref   = node;
            value = node.value;
            node  = node.__context;
            path  = clone_array(value);
            if(node != null) {
                type = node.$type;
                nodes[0] = node;
            } else {
                path.length = 0;
                nodes = get_reference_sync(onLink, value, clone_array(roots), clone_array(nodes), path);
                path  = nodes.path;
                nodes = nodes.nodes;
                node = nodes[0];
                if(node != null && typeof node == "object") {
                    type = node.$type;
                    back = node.__refs_length || 0;
                    node.__refs_length = back + 1;
                    node["__ref" + back] = ref;
                    ref.__context = node;
                    ref.__ref_index = back;
                } else {
                    // pbv = Object.create(null);
                    pbv = {};
                    pbv.path = path;
                    pbv.value = node;
                    return pbv;
                }
            }
        } while(type == "reference");
    }
    
    if(!!type) {
        // pbv = Object.create(null);
        pbv = {};
        pbv.path = path;
        pbv.value = node.value;
        return pbv;
    }
    
    key = rest[0];
    
    onLink(nodes, nodes, key);
    
    return get_value_sync(onLink, slice_array(rest, 1), roots, clone_array(nodes), concat_array(path, key));
}

function get_reference_sync(onLink, rest, parents, nodes, path) {
    
    var node = parents[0], pbv;
    
    if(rest.length == 0 || node == null || typeof node != "object" || !!node.$type) {
        // pbv = Object.create(null);
        pbv = {};
        pbv.path = path;
        pbv.nodes = parents;
        return pbv;
    }
    
    var key = rest[0];
    
    onLink(parents, nodes, key);
    
    return get_reference_sync(onLink, slice_array(rest, 1), clone_array(parents), clone_array(nodes), concat_array(path, key));
}

function fromKeySet(key, iskeyset) {
    if(iskeyset) {
        if(isArray(key)) {
            key = key[key.__offset || (key.__offset = 0)];
            return fromKeySet(key, key != null && typeof key === "object");
        } else {
            if(key.__offset === undefined) {
                key.__offset = key.from || (key.from = 0);
            }
            return key.__offset;
        }
    }
    return key;
}

function permuteKey(key) {
    if(isArray(key)) {
        if(++key.__offset === key.length) {
            return permuteKey(key[key.__offset = 0]);
        } else {
            return false;
        }
    } else if(key != null && typeof key === "object") {
        if(++key.__offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
            key.__offset = key.from;
            return true;
        }
        return false;
    }
    return true;
}

function clone_array(array) {
    var n = array.length;
    var array2 = new Array(n);
    for(var i = -1; ++i < n;) { array2[i] = array[i]; }
    return array2;
}

function concat_array(array, value) {
    var n = array.length;
    var array2 = new Array(n + 1);
    for(var i = -1; ++i < n;) { array2[i] = array[i]; }
    array2[i] = value;
    return array2;
}

function slice_array(array, index) {
    var n = array.length - index;
    var array2 = new Array(n);
    for(var i = -1; ++i < n;) { array2[i] = array[i + index]; }
    return array2;
}

function onNode(parents, nodes, key, iskeyset) {
    
    // if(key != null) {
        var node = nodes[0];
        var mapp = nodes[1];
        
        parents[0] = node;
        parents[1] = mapp;
        
        nodes[0] = node[key];
        nodes[1] = mapp[key] || (mapp[key] = {});
        // nodes[1] = mapp[key] || (mapp[key] = Object.create(null));
        
        // var type = node && node.$type || undefined;
        
        // if(node != null && typeof node == "object" && (!type || type == "reference")) {
        //     nodes[1] = mapp[key] || (mapp[key] = Object.create(null));
        // }
    // }
    
    return true;
}

function onLink(parents, nodes, key) {
    var node = parents[0];
    parents[0] = node[key];
    parents[1] = nodes[1];
    return true;
}

function onEdge(parents, nodes, values, key, iskeyset, requested, optimized) {
    
    // if(key != null) {
        var node = nodes[0];
        // var mapp = parents[1];
        // var type = node && node.$type || undefined;
        // mapp[key] = !!type ? node.value : node;
        var mapp = nodes[1];
        
        mapp.$type = node.$type;
        mapp.value = node.value;
    // }
    
    return true;
}

function execute() {
    
    var i = -1;
    var n = 10;
    var root = getCache();
    // var pathset = ["lolomo", {to: 9}, {to: 9}, "item", "summary"];
    var pathset = ["lolomo", {to: 9}, {to: 3}, "item", "summary"];
    // var pathset = ["lolomo", 0, 0, "item", "summary"];
    
    var exec = new Array(n);
    
    while(++i < n) {
        var t = Date.now();
        var j = 0;
        do {
        // while(++i < 2) {
            
            // console.log(inspect(get_value_sync(onLink, pathset, [root], [root], []), {depth: null}));
            // get_value_sync(onLink, pathset, [root], [root], []);
            
            // var map = Object.create(null);
            var map = {};
            
            get_pathset_sync(
                onNode, onLink, onEdge, pathset,
                [root, map], [root, map],
                [root, map], null, [], []
            );
            
            // console.log(inspect(map, {depth: null}));
        } while(++j && Date.now() - t < 1000);
        exec[i] = j;
    }
    
    console.log(exec.reduce(function(x, i) { return x + i; }, 0) / n);
}

function getCache() {
    return {
        "lolomo" : { "$type": "reference", "value": ["lolomos", "123"] },
        "lolomos": { "123": {
            "0": { "$type": "reference", "value": ["lists", "012"] },
            "1": { "$type": "reference", "value": ["lists", "123"] },
            "2": { "$type": "reference", "value": ["lists", "234"] },
            "3": { "$type": "reference", "value": ["lists", "345"] },
            "4": { "$type": "reference", "value": ["lists", "456"] },
            "5": { "$type": "reference", "value": ["lists", "567"] },
            "6": { "$type": "reference", "value": ["lists", "678"] },
            "7": { "$type": "reference", "value": ["lists", "789"] },
            "8": { "$type": "reference", "value": ["lists", "890"] },
            "9": { "$type": "reference", "value": ["lists", "901"] },
        } },
        "lists"  : {
            "012": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "123": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "234": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "345": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "456": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "567": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "678": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "789": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "890": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
            "901": {
                "0": { "$type": "reference", "value": ["recommendations", "012"] },
                "1": { "$type": "reference", "value": ["recommendations", "123"] },
                "2": { "$type": "reference", "value": ["recommendations", "234"] },
                "3": { "$type": "reference", "value": ["recommendations", "345"] },
                "4": { "$type": "reference", "value": ["recommendations", "456"] },
                "5": { "$type": "reference", "value": ["recommendations", "567"] },
                "6": { "$type": "reference", "value": ["recommendations", "678"] },
                "7": { "$type": "reference", "value": ["recommendations", "789"] },
                "8": { "$type": "reference", "value": ["recommendations", "890"] },
                "9": { "$type": "reference", "value": ["recommendations", "901"] },
            },
        },
        "recommendations"  : {
            "012": { "item": { "$type": "reference", "value": ["videos", "012"] } },
            "123": { "item": { "$type": "reference", "value": ["videos", "123"] } },
            "234": { "item": { "$type": "reference", "value": ["videos", "234"] } },
            "345": { "item": { "$type": "reference", "value": ["videos", "345"] } },
            "456": { "item": { "$type": "reference", "value": ["videos", "456"] } },
            "567": { "item": { "$type": "reference", "value": ["videos", "567"] } },
            "678": { "item": { "$type": "reference", "value": ["videos", "678"] } },
            "789": { "item": { "$type": "reference", "value": ["videos", "789"] } },
            "890": { "item": { "$type": "reference", "value": ["videos", "890"] } },
            "901": { "item": { "$type": "reference", "value": ["videos", "901"] } },
        },
        "videos" : {
            "012": { "summary": { "$type": "sentinel", "value": "012" } },
            "123": { "summary": { "$type": "sentinel", "value": "123" } },
            "234": { "summary": { "$type": "sentinel", "value": "234" } },
            "345": { "summary": { "$type": "sentinel", "value": "345" } },
            "456": { "summary": { "$type": "sentinel", "value": "456" } },
            "567": { "summary": { "$type": "sentinel", "value": "567" } },
            "678": { "summary": { "$type": "sentinel", "value": "678" } },
            "789": { "summary": { "$type": "sentinel", "value": "789" } },
            "890": { "summary": { "$type": "sentinel", "value": "890" } },
            "901": { "summary": { "$type": "sentinel", "value": "901" } },
        }
    };
}