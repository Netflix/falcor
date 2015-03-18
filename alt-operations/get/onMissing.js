var support = require('../util/support');
var spreadJSON = support.spreadJSON,
    fastCat = support.fastCat,
    fastCatSkipNulls = support.fastCatSkipNulls,
    fastCopy = support.fastCopy,
    isExpired = support.isExpired;
var clone = require('./../util/clone');

module.exports = function onMissing(model, path, depth, permuteRequested, permuteOptimized, permutePosition, results, type) {
    var pathSlice;
    
    if (model.materialized) {
        
        
    } else {
        if (Array.isArray(path)) {
            if (depth < path.length) {
                pathSlice = fastCopy(path, depth);
            } else {
                pathSlice = [];
            }

            concatAndInsertMissing(pathSlice, results, permuteRequested, permuteOptimized, permutePosition, type);
        } else {
            pathSlice = [];
            spreadJSON(path, pathSlice);

            if (pathSlice.length) {
                for (var i = 0, len = pathSlice.length; i < len; i++) {
                    concatAndInsertMissing(pathSlice[i], results, permuteRequested, permuteOptimized, permutePosition, type, true);
                }
            } else {
                concatAndInsertMissing(pathSlice, results, permuteRequested, permuteOptimized, permutePosition, type);
            }
        }
    }
};

function concatAndInsertMissing(remainingPath, results, permuteRequested, permuteOptimized, permutePosition, type, __null) {
    var i = 0, len;
    if (__null) {
        for (i = 0, len = remainingPath.length; i < len; i++) {
            if (remainingPath[i] === '__null') {
                remainingPath[i] = null;
            }
        }
    }
    if (type === 'JSON') {
        permuteRequested = fastCat(permuteRequested, remainingPath);
        for (i = 0, len = permutePosition.length; i < len; i++) {
            var idx = permutePosition[i];
            var r = permuteRequested[idx];
            // TODO: i think the typeof operator is no needed if there is better management of permutePosition addition
            if (typeof r !== 'object') {
                permuteRequested[idx] = [r];
            }
        }
        results.requestedMissingPaths.push(permuteRequested);
        results.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, remainingPath));
    } else {
        results.requestedMissingPaths.push(fastCat(permuteRequested, remainingPath));
        results.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, remainingPath));
    }
}

