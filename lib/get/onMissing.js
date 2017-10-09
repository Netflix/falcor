var support = require("./util/support");
var fastCopy = support.fastCopy;
var fastCat = support.fastCat;
var arraySlice = require("./../support/array-slice");

module.exports = function onMissing(model, path, depth,
                                    outerResults, requestedPath,
                                    optimizedPath, optimizedLength) {
    var pathSlice;
    if (!outerResults.requestedMissingPaths) {
        outerResults.requestedMissingPaths = [];
        outerResults.optimizedMissingPaths = [];
        outerResults.depthDifferences = [];
    }

    if (depth < path.length) {
        // If part of path has not been traversed, we need to ensure that there
        // are no empty paths (range(1, 0) or empyt array)
        var isEmpty = false;
        for (var i = depth; i < path.length && !isEmpty; ++i) {
            if (isEmptyAtom(path[i])) {
                return;
            }
        }

        pathSlice = fastCopy(path, depth);
    } else {
        pathSlice = [];
    }

    concatAndInsertMissing(model, pathSlice, depth, requestedPath,
                           optimizedPath, optimizedLength, outerResults);
};

function concatAndInsertMissing(model, remainingPath, depth, requestedPath,
                                optimizedPath, optimizedLength, results) {
    results.requestedMissingPaths[results.requestedMissingPaths.length] =
        fastCat(arraySlice(requestedPath, 0, depth), remainingPath);

    results.optimizedMissingPaths[results.optimizedMissingPaths.length] =
        fastCat(arraySlice(optimizedPath, 0, optimizedLength), remainingPath);

    results.depthDifferences[results.depthDifferences.length] = depth - optimizedLength;
}

function isEmptyAtom(atom) {
    if (atom === null || typeof atom !== "object") {
        return false;
    }

    var isArray = Array.isArray(atom);
    if (isArray && atom.length) {
        return false;
    }

    // Empty array
    else if (isArray) {
        return true;
    }

    var from = atom.from;
    var to = atom.to;
    if (from === undefined || from <= to) {
        return false;
    }

    return true;
}
