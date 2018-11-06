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
 * `intersectionData` is:
 * [ requestedIntersection, optimizedComplement, requestedComplement ]
 * where `requestedIntersection` is matched requested paths that can be
 * deduped, `optimizedComplement` is missing optimized paths, and
 * `requestedComplement` is requested counterparts of those missing
 * optimized paths
 */
module.exports = function complement(requested, optimized, tree) {
    var optimizedComplement = [];
    var requestedComplement = [];
    var requestedIntersection = [];
    var intersectionLength = -1, complementLength = -1;

    for (var i = 0, len = optimized.length; i < len; ++i) {
        var oPath = optimized[i];
        var rPath = requested[i];
        var subTree = tree[oPath.length];

        var intersectionData = findPartialIntersections(rPath, oPath, subTree);
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
 *
 * Example scenario:
 *      - requestedPath: ['lolomo', 0, 0, 'tags', { from: 0, to: 2 }]
 *      - optimizedPath: ['videosById', 11, 'tags', { from: 0, to: 2 }]
 *      - currentTree: { videosById: 11: { tags: { 0: null, 1: null }}}
 *
 * Returns a 3-tuple consisting of
 *  - the intersection of requested paths with currentTree
 *  - the complement of optimized paths with currenTree
 *  - the complement of corresponding requested paths with currentTree
 */
function findPartialIntersections(requestedPath, optimizedPath, currentTree) {
    var depthDiff = requestedPath.length - optimizedPath.length;

    // Pre-descend into the sub tree (when the optimized path is longer than the requested path)
    for (var i = 0; currentTree && i < -depthDiff; i++) {
        currentTree = currentTree[optimizedPath[i]];
    }

    // No matching path, cannot dedupe
    if (!currentTree) {
        return [[], [optimizedPath], [requestedPath]];
    }

    if (depthDiff === 0) {
        return findPartialIntersectionsRec(requestedPath, optimizedPath, currentTree, 0, [], [], 0);
    } else if (depthDiff > 0) {
        return findPartialIntersectionsRec(requestedPath, optimizedPath, currentTree, 0, arraySlice(requestedPath, 0, depthDiff), [], depthDiff);
    } else { // depthDiff < 0
        return findPartialIntersectionsRec(requestedPath, optimizedPath, currentTree, -depthDiff, [], arraySlice(optimizedPath, 0, -depthDiff), depthDiff);
    }
}

function findPartialIntersectionsRec(
    requestedPath,
    optimizedPath,
    currentTree,
    depth,
    rCurrentPath,
    oCurrentPath,
    depthDiff
) {
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
                        arraySlice(optimizedPath, depth + 1)
                    );
                    oComplementPaths[oComplementPaths.length] = oPath;
                    var rPath = rCurrentPath.concat(
                        innerKey,
                        arraySlice(requestedPath, depth + 1 + depthDiff)
                    );
                    rComplementPaths[rComplementPaths.length] = rPath;
                } else if (depth === optimizedPath.length - 1) {
                    // reaching the end of optimized path means that we found a
                    // corresponding node in the path map tree every time,
                    // so add current path to successful intersections
                    intersections[intersections.length] = arrayConcat(rCurrentPath, [innerKey]);
                } else {
                    // otherwise keep trying to find further partial deduping
                    // opportunities in the remaining path!
                    var intersectionData = findPartialIntersectionsRec(
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

// Exported for unit testing.
module.exports.findPartialIntersections = findPartialIntersections;
