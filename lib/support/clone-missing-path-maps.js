var clone_requested = require("./clone-requested-path");
var clone_optimized = require("./clone-optimized-path");
var walk_path_map   = require("../walk/walk-path-map-soft-link");
var is_object = require("./is-object");
var empty = [];

module.exports = function(roots, pathmap, keys_stack, depth, requested, optimized) {
    var patset_keys = explode_keys(pathmap, keys_stack.concat(), depth);
    var pathset = patset_keys.map(function(keys) {
        keys = keys.filter(function(key) { return key != "null"; });
        switch(keys.length) {
            case 0:
                return null;
            case 1:
                return keys[0];
            default:
                return keys;
        }
    });
    
    roots.requestedMissingPaths.push(clone_requested(roots.bound, requested, pathset, depth, roots.index));
    roots.optimizedMissingPaths.push(clone_optimized(optimized, pathset, depth));
}

function explode_keys(pathmap, keys_stack, depth) {
    if(is_object(pathmap)) {
        var keys = Object.keys(pathmap);
        var keys2 = keys_stack[depth] || (keys_stack[depth] = []);
        keys2.push.apply(keys2, keys);
        keys.forEach(function(key) {
            explode_keys(pathmap[key], keys_stack, depth + 1);
        });
    }
    return keys_stack;
}