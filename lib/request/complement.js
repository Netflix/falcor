var hasIntersection = require("falcor-path-utils").hasIntersection;
var arraySlice = require("./../support/array-slice");
var arrayConcat = require("./../support/array-concat");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;

/**
 * creates the complement of the requested and optimized paths
 * based on the provided tree.
 *
 * If there is no complement then this is just a glorified
 * array copy.
 */
module.exports = function complement(requested, optimized, depthDifferences, tree) {
    var optimizedComplement = [];
    var requestedComplement = [];
    var requestedIntersection = [];
    var intersectionLength = -1, complementLength = -1;

    for (var i = 0, len = optimized.length; i < len; ++i) {
        // If this does not intersect then add it to the output.
        var oPath = optimized[i];
        var rPath = requested[i];
        var depthDiff = depthDifferences[i];
        var subTree = tree[oPath.length];

        // if no existing requested sub tree at all for path,
        // just add the entire path to complement
        // (no deduping possible)
        if (!subTree) {
            optimizedComplement[++complementLength] = oPath;
            requestedComplement[complementLength] = rPath;
            continue;
        }
        // if required path is a complete subset of given sub tree,
        // just add the entire path to intersection
        // (fully deduped)
        if (hasIntersection(subTree, oPath, 0)) {
            requestedIntersection[++intersectionLength] = rPath;
            continue;
        }
        // if some part of path, when ranges are expanded, is a subset
        // of given sub tree, then add only that part to intersection,
        // and all other parts of this path to complement

        // intersectionData is:
        // [ requestedIntersection, optimizedComplement, requestedComplement ]
        // where requestedIntersection is matched requested paths for , and
        // complements is paths not found, from the total set of
        // individual paths (all ranges expanded)
        var intersectionData = findPartialIntersections(
            rPath,
            oPath,
            subTree,
            0,
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

function findPartialIntersections(requestedPath, optimizedPath, currentTree, depth, rCurrentPath, oCurrentPath, depthDiff) {
    var intersections = [];
    var rRemainingComplementPaths = [];
    var oRemainingComplementPaths = [];
    for (; depth < optimizedPath.length; ++depth) {
        var key = optimizedPath[depth];
        var keyType = typeof key;

        // range keys
        if (key && keyType === "object") {
            var note = {};
            var innerKey = iterateKeySet(key, note);

            while (!note.done) {
                var nextTree = currentTree[innerKey];
                // dead-end for sub paths innerKey & beyond
                if (nextTree === undefined) {
                    var oRemainingPath = oCurrentPath.concat(
                        innerKey,
                        arraySlice(
                            optimizedPath,
                            depth + 1));
                    oRemainingComplementPaths[oRemainingComplementPaths.length] = oRemainingPath;
                    var rRemainingPath = rCurrentPath.concat(
                        innerKey,
                        arraySlice(
                            requestedPath,
                            depth + 1 + depthDiff));
                    rRemainingComplementPaths[rRemainingComplementPaths.length] = rRemainingPath;
                } else if (depth === optimizedPath.length - 1) {
                    intersections[intersections.length] = arrayConcat(rCurrentPath, [innerKey]);
                } else {
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
                        oRemainingComplementPaths[oRemainingComplementPaths.length] = intersectionData[1][k];
                        rRemainingComplementPaths[rRemainingComplementPaths.length] = intersectionData[2][k];
                    }
                }
                innerKey = iterateKeySet(key, note);
            }
            break;
        }
        // simple keys
        currentTree = currentTree[key];
        // TODO: recheck this. might have to be different for depthDiff > or < 0
        oCurrentPath[oCurrentPath.length] = optimizedPath[depth];
        rCurrentPath[rCurrentPath.length] = requestedPath[depth + depthDiff];
        if (currentTree === undefined) {
            oRemainingComplementPaths[oRemainingComplementPaths.length] =
                arrayConcat(oCurrentPath, arraySlice(optimizedPath, depth + 1));
            rRemainingComplementPaths[rRemainingComplementPaths.length] =
                arrayConcat(rCurrentPath, arraySlice(requestedPath, depth + depthDiff + 1));
            break;
        } else if (depth === optimizedPath.length - 1) {
            intersections[intersections.length] = rCurrentPath;
        }
    }

    return [intersections, oRemainingComplementPaths, rRemainingComplementPaths];
}

