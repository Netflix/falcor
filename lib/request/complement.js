var hasIntersection = require('falcor-path-utils').hasIntersection;

/**
 * creates the complement of the requested and optimized paths
 * based on the provided tree.
 *
 * If there is no complement then the this is just a glorified
 * array copy.
 */
module.exports = function complement(requested, optimized, tree) {
    var out = [];
    var outRequested = [];
    var complementRequested = [];
    var outLength = -1, complementLength = -1;

    for (var i = 0, len = optimized.length; i < len; ++i) {
        // If this does not intersect then add it to the output.
        var path = optimized[i];
        var subTree = tree[path.length];

        // If there is no subtree to look into or there is no intersection.
        if (!subTree || !hasIntersection(subTree, path, 0)) {
            out[++complementLength] = path;
            complementRequested[complementLength] = requested[i];
        } else {
            outRequested[++outLength] = requested[i];
        }
    }
    return [outRequested, out, complementRequested];
};
