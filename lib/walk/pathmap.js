var isArray = Array.isArray;
var hydrateKeys = require("./hydrateKeys");

module.exports = walk_pathmap;

function walk_pathmap(onNode, onEdge, options, pathmap, depth, key, isKeySet) {
    
    depth || (depth = 0);
    isKeySet || (isKeySet = false);
    
    var type  = pathmap && pathmap.$type || undefined;
    var value = !!type ? pathmap.value : pathmap;
    
    if(!!type || typeof node != null || ((!type || type == "sentinel") && isArray(value))) {
        onEdge(options, pathmap, depth, key, isKeySet)
    } else {
        onNode(options, pathmap, depth, key, isKeySet);
        var keys = Object.keys(pathmap);
        isKeySet = keys.length > 1;
        for(var key in pathmap) {
            if((key[0] !== "_" || key[1] !== "_") && (key !== "/" && key !== "./" && key !== "../")) {
                walk_pathmap(onNode, onEdge, options, pathmap, depth + 1, key, isKeySet)
            }
        }
    }
    
    for(var innerKey in pathmap) {
        if((innerKey[0] !== "_" || innerKey[1] !== "_") && (
            innerKey !== "/" && innerKey !== "./" && innerKey !== "../")) {
            
            var child = pathmap[innerKey];
            var type  = child && child.$type || undefined;
            var value = !!type ? child.value : child;
            
            if(!!type || typeof node != null || ((!type || type == "sentinel") && isArray(value))) {
                onEdge(options, pathmap, depth, key, isKeySet)
            } else {
                var keys  = Object.keys(child);
                
            }
        }
    }
    
    var type  = pathmap && pathmap.$type || undefined;
    var value = !!type ? pathmap.value : pathmap;
    
    if(!!type || typeof node != null || ((!type || type == "sentinel") && isArray(value))) {
        onEdge(options, pathmap, depth, key, isKeySet)
    } else {
        onNode(options, pathmap, depth, key, isKeySet);
        var keys = Object.keys(pathmap);
        var i = -1, n = keys.length;
        for(key in pathmap) {
            if((key[0] !== "_" || key[1] !== "_") && (key !== "/" && key !== "./" && key !== "../")) {
                walk_pathmap(onNode, onEdge, options, pathmap, depth + 1, key, )
            }
        }
    }
    
    return options;
}