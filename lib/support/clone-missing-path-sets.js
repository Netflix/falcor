var clone_requested_path = require("./clone-requested-path");
var clone_optimized_path = require("./clone-optimized-path");
module.exports = function clone_missing_path_sets(roots, pathset, depth, requested, optimized) {
    roots.requestedMissingPaths.push(clone_requested_path(roots.bound, requested, pathset, depth, roots.index));
    roots.optimizedMissingPaths.push(clone_optimized_path(optimized, pathset, depth));
}