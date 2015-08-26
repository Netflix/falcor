var support = require("./util/support");
var fastCat = support.fastCat,
    fastCatSkipNulls = support.fastCatSkipNulls,
    fastCopy = support.fastCopy;
var spreadJSON = require("./util/spreadJSON");

module.exports = function onMissing(model, path, depth,
                                    outerResults, requestedPath,
                                    optimizedPath) {
    var pathSlice;
    if (!outerResults.requestedMissingPaths) {
        outerResults.requestedMissingPaths = [];
        outerResults.optimizedMissingPaths = [];
    }

    // Paths Input
    if (Array.isArray(path)) {
        if (depth < path.length) {
            pathSlice = fastCopy(path, depth);
        } else {
            pathSlice = [];
        }

        concatAndInsertMissing(pathSlice, requestedPath,
                               optimizedPath, outerResults);
    }

    // JSON Input
    else {
        pathSlice = [];
        spreadJSON(path, pathSlice);

        for (var i = 0, len = pathSlice.length; i < len; i++) {
            concatAndInsertMissing(
                pathSlice[i], requestedPath, optimizedPath, outerResults);
        }
    }
};

function concatAndInsertMissing(remainingPath, requestedPath, optimizedPath, results) {
    results.requestedMissingPaths.push(fastCat(requestedPath, remainingPath));
    results.optimizedMissingPaths.push(fastCatSkipNulls(optimizedPath, remainingPath));
}
