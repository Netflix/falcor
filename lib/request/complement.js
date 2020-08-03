var iterateKeySet = require("falcor-path-utils").iterateKeySet;

/**
 * Calculates what paths in requested path sets can be deduplicated based on an existing optimized path tree.
 *
 * For path sets with ranges or key sets, if some expanded paths can be found in the path tree, only matching paths are
 * returned as intersection. The non-matching expanded paths are returned as complement.
 *
 * The function returns an object consisting of:
 * - intersection: requested paths that were matched to the path tree
 * - optimizedComplement: optimized paths that were not found in the path tree
 * - requestedComplement: requested paths for the optimized paths that were not found in the path tree
 */
module.exports = function complement(requested, optimized, tree) {
    var optimizedComplement = [];
    var requestedComplement = [];
    var intersection = [];
    var i, iLen;

    for (i = 0, iLen = optimized.length; i < iLen; ++i) {
        var oPath = optimized[i];
        var rPath = requested[i];
        var subTree = tree[oPath.length];

        var intersectionData = findPartialIntersections(rPath, oPath, subTree);
        Array.prototype.push.apply(intersection, intersectionData[0]);
        Array.prototype.push.apply(optimizedComplement, intersectionData[1]);
        Array.prototype.push.apply(requestedComplement, intersectionData[2]);
    }

    return {
        intersection: intersection,
        optimizedComplement: optimizedComplement,
        requestedComplement: requestedComplement
    };
};

/**
 * Recursive function to calculate intersection and complement paths in 2 given pathsets at a given depth.
 *
 * Parameters:
 *  - requestedPath: full requested path set (can include ranges)
 *  - optimizedPath: corresponding optimized path (can include ranges)
 *  - requestTree: path tree for in-flight request, against which to dedupe
 *
 * Returns a 3-tuple consisting of
 *  - the intersection of requested paths with requestTree
 *  - the complement of optimized paths with requestTree
 *  - the complement of corresponding requested paths with requestTree
 *
 * Example scenario:
 *  - requestedPath: ['lolomo', 0, 0, 'tags', { from: 0, to: 2 }]
 *  - optimizedPath: ['videosById', 11, 'tags', { from: 0, to: 2 }]
 *  - requestTree: { videosById: 11: { tags: { 0: null, 1: null }}}
 *
 * This returns:
 * [
 *   [['lolomo', 0, 0, 'tags', 0], ['lolomo', 0, 0, 'tags', 1]],
 *   [['videosById', 11, 'tags', 2]],
 *   [['lolomo', 0, 0, 'tags', 2]]
 * ]
 *
 */
function findPartialIntersections(requestedPath, optimizedPath, requestTree) {
    var depthDiff = requestedPath.length - optimizedPath.length;
    var i;

    // Descend into the request path tree for the optimized-path prefix (when the optimized path is longer than the
    // requested path)
    for (i = 0; requestTree && i < -depthDiff; i++) {
        requestTree = requestTree[optimizedPath[i]];
    }

    // There is no matching path in the request path tree, thus no candidates for deduplication
    if (!requestTree) {
        return [[], [optimizedPath], [requestedPath]];
    }

    if (depthDiff === 0) {
        return recurse(requestedPath, optimizedPath, requestTree, 0, [], []);
    } else if (depthDiff > 0) {
        return recurse(requestedPath, optimizedPath, requestTree, 0, requestedPath.slice(0, depthDiff), []);
    } else {
        return recurse(requestedPath, optimizedPath, requestTree, -depthDiff, [], optimizedPath.slice(0, -depthDiff));
    }
}

function recurse(requestedPath, optimizedPath, currentTree, depth, rCurrentPath, oCurrentPath) {
    var depthDiff = requestedPath.length - optimizedPath.length;
    var intersections = [];
    var rComplementPaths = [];
    var oComplementPaths = [];
    var oPathLen = optimizedPath.length;

    // Loop over the optimized path, looking for deduplication opportunities
    for (; depth < oPathLen; ++depth) {
        var key = optimizedPath[depth];
        var keyType = typeof key;

        if (key && keyType === "object") {
            // If a range key is found, start an inner loop to iterate over all keys in the range, and add
            // intersections and complements from each iteration separately.
            //
            // Range keys branch out this way, providing individual deduping opportunities for each inner key.
            var note = {};
            var innerKey = iterateKeySet(key, note);

            while (!note.done) {
                var nextTree = currentTree[innerKey];
                if (nextTree === undefined) {
                    // If no next sub tree exists for an inner key, it's a dead-end and we can add this to
                    // complement paths
                    oComplementPaths[oComplementPaths.length] = arrayConcatSlice2(
                        oCurrentPath,
                        innerKey,
                        optimizedPath, depth + 1
                    );
                    rComplementPaths[rComplementPaths.length] = arrayConcatSlice2(
                        rCurrentPath,
                        innerKey,
                        requestedPath, depth + 1 + depthDiff
                    );
                } else if (depth === oPathLen - 1) {
                    // Reaching the end of the optimized path means that we found the entire path in the path tree,
                    // so add it to intersections
                    intersections[intersections.length] = arrayConcatElement(rCurrentPath, innerKey);
                } else {
                    // Otherwise keep trying to find further partial deduping opportunities in the remaining path
                    var intersectionData = recurse(
                        requestedPath, optimizedPath,
                        nextTree,
                        depth + 1,
                        arrayConcatElement(rCurrentPath, innerKey),
                        arrayConcatElement(oCurrentPath, innerKey)
                    );

                    Array.prototype.push.apply(intersections, intersectionData[0]);
                    Array.prototype.push.apply(oComplementPaths, intersectionData[1]);
                    Array.prototype.push.apply(rComplementPaths, intersectionData[2]);
                }
                innerKey = iterateKeySet(key, note);
            }

            // The remainder of the path was handled by the recursive call, terminate the loop
            break;
        } else {
            // For simple keys, we don't need to branch out. Loop over `depth` instead of iterating over a range.
            currentTree = currentTree[key];
            oCurrentPath[oCurrentPath.length] = optimizedPath[depth];
            rCurrentPath[rCurrentPath.length] = requestedPath[depth + depthDiff];

            if (currentTree === undefined) {
                // The path was not found in the tree, add this to complements
                oComplementPaths[oComplementPaths.length] = arrayConcatSlice(
                    oCurrentPath, optimizedPath, depth + 1
                );
                rComplementPaths[rComplementPaths.length] = arrayConcatSlice(
                    rCurrentPath, requestedPath, depth + depthDiff + 1
                );

                break;
            } else if (depth === oPathLen - 1) {
                // The end of optimized path was reached, add to intersections
                intersections[intersections.length] = rCurrentPath;
            }
        }
    }

    // Return accumulated intersection and complement paths
    return [intersections, oComplementPaths, rComplementPaths];
}

// Exported for unit testing.
module.exports.__test = { findPartialIntersections: findPartialIntersections };

/**
 * Create a new array consisting of a1 + a subset of a2. Avoids allocating an extra array by calling `slice` on a2.
 */
function arrayConcatSlice(a1, a2, start) {
    var result = a1.slice();
    var l1 = result.length;
    var length = a2.length - start;
    result.length = l1 + length;
    for (var i = 0; i < length; ++i) {
        result[l1 + i] = a2[start + i];
    }
    return result;
}

/**
 * Create a new array consisting of a1 + a2 + a subset of a3. Avoids allocating an extra array by calling `slice` on a3.
 */
function arrayConcatSlice2(a1, a2, a3, start) {
    var result = a1.concat(a2);
    var l1 = result.length;
    var length = a3.length - start;
    result.length = l1 + length;
    for (var i = 0; i < length; ++i) {
        result[l1 + i] = a3[start + i];
    }
    return result;
}

/**
 * Create a new array consistent of a1 plus an additional element. Avoids the unnecessary array allocation when using `a1.concat([element])`.
 */
function arrayConcatElement(a1, element) {
    var result = a1.slice();
    result.push(element);
    return result;
}
