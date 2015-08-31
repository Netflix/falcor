var support = require("./util/support");
var fastCopy = support.fastCopy;
var spreadJSON = require("./util/spreadJSON");

module.exports = function onMissing(model, path, depth,
                                    outerResults, requestedPath,
                                    optimizedPath) {
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

    concatAndInsertMissing(pathSlice, depth, requestedPath,
                           optimizedPath, outerResults);
};

function concatAndInsertMissing(remainingPath, depth, requestedPath,
                                optimizedPath, results) {
    results.requestedMissingPaths.push(requestedPath.slice(0, depth).concat(remainingPath));
    results.optimizedMissingPaths.push(optimizedPath.concat(remainingPath));
}
