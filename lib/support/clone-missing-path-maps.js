var cloneRequestedPath = require("./../support/clone-requested-path");
var cloneOptimizedPath = require("./../support/clone-optimized-path");
var isObject = require("./../support/is-object");

module.exports = function cloneMissingPathMaps(roots, pathmap, keysStack, depth, requested, optimized) {
    var pathset = explodeKeys(pathmap, keysStack.concat(), depth).map(function(keys) {
        // keys = keys.filter(function(key) { return key != "null"; });
        switch (keys.length) {
        case 0:
            return null;
        case 1:
            return keys[0];
        default:
            return keys;
        }
    });
    roots.requestedMissingPaths.push(cloneRequestedPath(roots.bound, requested, pathset, depth, roots.index));
    roots.optimizedMissingPaths.push(cloneOptimizedPath(optimized, pathset, depth));
};

function explodeKeys(pathmap, keysStack, depth) {
    if (isObject(pathmap)) {
        var keys = Object.keys(pathmap);
        var keys2 = keysStack[depth] || (keysStack[depth] = []);
        keys2.push.apply(keys2, keys);
        keys.forEach(function(key) {
            explodeKeys(pathmap[key], keysStack, depth + 1);
        });
    }
    return keysStack;
}
