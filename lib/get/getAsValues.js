var getBoundValue = require('./../get/getBoundValue');
var isPathValue = require('./../get/util/isPathValue');
module.exports = function(walk) {
    return function getAsValues(model, paths, onNext) {
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) || isPathValue(paths[0]) ?
            'Paths' : 'JSON';
        var cache = model._cache;
        var boundPath = model._path;
        var currentCachePosition;
        var optimizedPath, boundOptimizedPath;
        if (boundPath.length) {
            var boundValue = getBoundValue(model, boundPath);
            currentCachePosition = boundValue.value;
            optimizedPath = boundOptimizedPath = boundValue.path;
        } else {
            currentCachePosition = cache;
            optimizedPath = boundOptimizedPath = [];
        }

        for (var i = 0, len = paths.length; i < len; i++) {
            if (len > 1) {
                optimizedPath = [];
                for (j = 0, bLen = boundOptimizedPath.length; j < bLen; j++) {
                    optimizedPath[j] = boundOptimizedPath[j];
                }
            }
            var pathSet = paths[i];
            if(inputFormat == 'JSON') {
                pathSet = pathSet.json;
            } else if (pathSet.path) {
                pathSet = pathSet.path;
            }
            walk(model, cache, currentCachePosition, pathSet, 0, onNext, null, results, optimizedPath, [], inputFormat, 'Values');
        }
        return results;
    };
};

