var cloneRequestedPath = require("./../support/clone-requested-path");
var cloneOptimizedPath = require("./../support/clone-optimized-path");
module.exports = function cloneMissingPathSets(roots, pathset, depth, requested, optimized) {
    roots.requestedMissingPaths.push(cloneRequestedPath(roots.bound, requested, pathset, depth, roots.index));
    roots.optimizedMissingPaths.push(cloneOptimizedPath(optimized, pathset, depth));
};
