var support = require("./util/support");
var fastCopy = support.fastCopy;

module.exports = function onMissing(model, path, depth,
                                    outerResults, requestedPath,
                                    optimizedPath, optimizedLength) {
    var pathSlice;
    if (!outerResults.requestedMissingPaths) {
        outerResults.requestedMissingPaths = [];
        outerResults.optimizedMissingPaths = [];
    }

    if (depth < path.length) {
        pathSlice = fastCopy(path, depth);
    } else {
        pathSlice = [];
    }

    concatAndInsertMissing(model, pathSlice, depth, requestedPath,
                           optimizedPath, optimizedLength, outerResults);
};

function concatAndInsertMissing(model, remainingPath, depth, requestedPath,
                                optimizedPath, optimizedLength, results) {

    // TODO: Performance.
    results.requestedMissingPaths.push(
        requestedPath.
            slice(0, depth).
            concat(remainingPath));

    results.optimizedMissingPaths.push(
        optimizedPath.slice(0, optimizedLength).concat(remainingPath));
}
