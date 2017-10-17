var hasIntersection = require("falcor-path-utils").hasIntersection;
var arraySlice = require("./../support/array-slice");
var arrayConcat = require("./../support/array-concat");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;

/**
 * Figures out what paths in requested pathsets can be
 * deduped based on existing optimized path tree provided.
 *
 * ## no deduping possible:
 *
 * if no existing requested sub tree at all for path,
 * just add the entire path to complement.
 *
 * ## fully deduped:
 *
 * if required path is a complete subset of given sub tree,
 * just add the entire path to intersection
 *
 * ## partial deduping:
 *
 * if some part of path, when ranges are expanded, is a subset
 * of given sub tree, then add only that part to intersection,
 * and all other parts of this path to complement
 *
 * To keep `depth` argument be a valid index for optimized path (`oPath`),
 * either requested or optimized path is sent in pre-initialized with
 * some items so that their remaining length matches exactly, keeping
 * remaining ranges in those pathsets 1:1 in correspondence
 *
 * Note that positive `depthDiff` value means that requested path is
 * longer than optimized path, and we need to pre-initialize current
 * requested path with that many offset items, so that their remaining
 * length matches. Similarly, negative `depthDiff` value means that
 * optimized path is longer, and we pre-initialize optimized path with
 * those many items. Note that because of the way requested and
 * optimized paths are accumulated from what user requested in model.get
 * (see onMissing.js), it is not possible for the pre-initialized paths
 * to have any ranges in them.
 *
 * `intersectionData` is:
 * [ requestedIntersection, optimizedComplement, requestedComplement ]
 * where `requestedIntersection` is matched requested paths that can be
 * deduped, `optimizedComplement` is missing optimized paths, and
 * `requestedComplement` is requested counterparts of those missing
 * optimized paths
 */
module.exports = function complement(requested, optimized, depthDifferences, tree) {
    var optimizedComplement = [];
    var requestedComplement = [];
    var requestedIntersection = [];
    var intersectionLength = -1, complementLength = -1;

    for (var i = 0, len = optimized.length; i < len; ++i) {
        var oPath = optimized[i];
        var rPath = requested[i];
        var depthDiff = depthDifferences[i];
        var subTree = tree[oPath.length];

        // no deduping possible
        if (!subTree) {
            optimizedComplement[++complementLength] = oPath;
            requestedComplement[complementLength] = rPath;
            continue;
        }
        // fully deduped
        if (hasIntersection(subTree, oPath, 0)) {
            requestedIntersection[++intersectionLength] = rPath;
            continue;
        }

        // partial deduping
        var intersectionData = findPartialIntersections(
            rPath,
            oPath,
            subTree,
            depthDiff < 0 ? -depthDiff : 0,
            depthDiff > 0 ? arraySlice(rPath, 0, depthDiff) : [],
            depthDiff < 0 ? arraySlice(oPath, 0, -depthDiff) : [],
            depthDiff);
        for (var j = 0, jLen = intersectionData[0].length; j < jLen; ++j) {
            requestedIntersection[++intersectionLength] = intersectionData[0][j];
        }
        for (var k = 0, kLen = intersectionData[1].length; k < kLen; ++k) {
            optimizedComplement[++complementLength] = intersectionData[1][k];
            requestedComplement[complementLength] = intersectionData[2][k];
        }
    }

    if (!requestedIntersection.length) {
        return null;
    }
    return [requestedIntersection, optimizedComplement, requestedComplement];
};

/**
 * Recursive function to calculate intersection and complement paths in 2 given
 * pathsets at a given depth
 * Parameters:
 *  - `requestedPath`: full requested path (can include ranges)
 *  - `optimizedPath`: corresponding optimized path (can include ranges)
 *  - `currentTree`: path map for in-flight request, against which to dedupe
 *  - `depth`: index of optimized path that we are trying to match with `currentTree`
 *  - `rCurrentPath`: current accumulated requested path by previous recursive
 *                    iterations. Could also have been pre-initialized as stated
 *                    above.
 *                    This path cannot contain ranges, instead contains a key
 *                    from the range, representing one of the individual paths
 *                    in `requestedPath` pathset
 *  - `oCurrentPath`: corresponding accumulated optimized path, to be matched
 *                    with `currentTree`. Could have been pre-initialized.
 *                    Cannot contain ranges, instead contains a key from the
 *                    range at given `depth` in `optimizedPath`
 *  - `depthDiff`: difference in length between `requestedPath` and `optimizedPath`
 *
 *  Example scenario:
 *      - requestedPath: ['lolomo', 0, 0, 'tags', { from: 0, to: 2 }]
 *      - optimizedPath: ['videosById', 11, 'tags', { from: 0, to: 2 }]
 *      - currentTree: { videosById: 11: { tags: { 0: null, 1: null }}}
 *      // since requested path is longer, optimized path index starts from depth 0
 *      // and accumulated requested path starts pre-initialized (rCurrentPath)
 *      - depth: 0
 *      - rCurrentPath: ['lolomo']
 *      - oCurrentPath: []
 *      - depthDiff: 1
 */
function findPartialIntersections(requestedPath, optimizedPath, currentTree, depth, rCurrentPath, oCurrentPath, depthDiff) {
    var intersections = [];
    var rComplementPaths = [];
    var oComplementPaths = [];
    // iterate over optimized path, looking for deduping opportunities
    for (; depth < optimizedPath.length; ++depth) {
        var key = optimizedPath[depth];
        var keyType = typeof key;

        // if range key is found, start inner loop to iterate over all keys in range
        // and add intersections and complements from each iteration separately.
        // range keys branch-out like this, providing individual deduping
        // opportunities for each inner key
        if (key && keyType === "object") {
            var note = {};
            var innerKey = iterateKeySet(key, note);

            while (!note.done) {
                var nextTree = currentTree[innerKey];
                if (nextTree === undefined) {
                    // if no next sub tree exists for an inner key, it's a dead-end
                    // and we can add this to complement paths
                    var oPath = oCurrentPath.concat(
                        innerKey,
                        arraySlice(
                            optimizedPath,
                            depth + 1));
                    oComplementPaths[oComplementPaths.length] = oPath;
                    var rPath = rCurrentPath.concat(
                        innerKey,
                        arraySlice(
                            requestedPath,
                            depth + 1 + depthDiff));
                    rComplementPaths[rComplementPaths.length] = rPath;
                } else if (depth === optimizedPath.length - 1) {
                    // reaching the end of optimized path means that we found a
                    // corresponding node in the path map tree every time,
                    // so add current path to successful intersections
                    intersections[intersections.length] = arrayConcat(rCurrentPath, [innerKey]);
                } else {
                    // otherwise keep trying to find further partial deduping
                    // opportunities in the remaining path!
                    var intersectionData = findPartialIntersections(
                        requestedPath,
                        optimizedPath,
                        nextTree,
                        depth + 1,
                        arrayConcat(rCurrentPath, [innerKey]),
                        arrayConcat(oCurrentPath, [innerKey]),
                        depthDiff);
                    for (var j = 0, jLen = intersectionData[0].length; j < jLen; ++j) {
                        intersections[intersections.length] = intersectionData[0][j];
                    }
                    for (var k = 0, kLen = intersectionData[1].length; k < kLen; ++k) {
                        oComplementPaths[oComplementPaths.length] = intersectionData[1][k];
                        rComplementPaths[rComplementPaths.length] = intersectionData[2][k];
                    }
                }
                innerKey = iterateKeySet(key, note);
            }
            break;
        }

        // for simple keys, we don't need to branch out. looping over `depth`
        // here instead of recursion, for performance
        currentTree = currentTree[key];
        oCurrentPath[oCurrentPath.length] = optimizedPath[depth];
        rCurrentPath[rCurrentPath.length] = requestedPath[depth + depthDiff];

        if (currentTree === undefined) {
            // if dead-end, add this to complements
            oComplementPaths[oComplementPaths.length] =
                arrayConcat(oCurrentPath, arraySlice(optimizedPath, depth + 1));
            rComplementPaths[rComplementPaths.length] =
                arrayConcat(rCurrentPath, arraySlice(requestedPath, depth + depthDiff + 1));
            break;
        } else if (depth === optimizedPath.length - 1) {
            // if reach end of optimized path successfully, add to intersections
            intersections[intersections.length] = rCurrentPath;
        }
        // otherwise keep going
    }

    // return accumulated intersection and complement pathsets
    return [intersections, oComplementPaths, rComplementPaths];
}

