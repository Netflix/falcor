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

    // Paths Input
    if (Array.isArray(path)) {
        if (depth < path.length) {
            pathSlice = fastCopy(path, depth);
        } else {
            pathSlice = [];
        }

        concatAndInsertMissing(pathSlice, depth, requestedPath,
                               optimizedPath, outerResults);
    }

    // JSON Input
    else {
        pathSlice = [];
        spreadJSON(path, pathSlice);

        for (var i = 0, len = pathSlice.length; i < len; i++) {
            concatAndInsertMissing(pathSlice[i], depth, requestedPath,
                                   optimizedPath, outerResults);
        }
    }
};

function concatAndInsertMissing(remainingPath, depth, requestedPath,
                                optimizedPath, results) {
    results.requestedMissingPaths.push(requestedPath.slice(0, depth + 1).concat(remainingPath));
    results.optimizedMissingPaths.push(optimizedPath.concat(remainingPath));
}
