var getBoundValue = require("./../get/getBoundValue");
var isPathValue = require("./../get/util/isPathValue");
var arraySlice = require("../support/array-slice");

module.exports = function(walk) {
    return function getAsJSON(model, paths, valuesArg) {
        var values = valuesArg;
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var requestedMissingPaths = results.requestedMissingPaths;
        var inputFormat = Array.isArray(paths[0]) || isPathValue(paths[0]) ?
            "Paths" : "JSON";
        var cache = model._root.cache;
        var boundPath = model._path;
        var currentCachePosition;
        var missingIdx = 0;
        var boundOptimizedPath, optimizedPath;
        var i, j, len, bLen;
        var valueNode, length;

        results.values = values;
        if (!values) {
            values = [];
        }
        if (boundPath.length) {
            var boundValue = getBoundValue(model, boundPath);
            currentCachePosition = boundValue.value;
            optimizedPath = boundOptimizedPath = boundValue.path;
        } else {
            currentCachePosition = cache;
            optimizedPath = boundOptimizedPath = [];
        }

        for (i = 0, len = paths.length; i < len; i++) {
            valueNode = void 0;
            var pathSet = paths[i];
            if (values[i]) {
                valueNode = values[i];
            }
            if (len > 1) {
                optimizedPath = arraySlice(boundOptimizedPath);
            }
            if (inputFormat === "JSON") {
                pathSet = pathSet.json;
            } else if (pathSet.path) {
                pathSet = pathSet.path;
            }

            walk(model, cache, currentCachePosition, pathSet, 0, valueNode, [], results, optimizedPath, [], inputFormat, "JSON");
            if (missingIdx < requestedMissingPaths.length) {
                for (j = missingIdx, length = requestedMissingPaths.length; j < length; j++) {
                    requestedMissingPaths[j].pathSetIndex = i;
                }
                missingIdx = length;
            }
        }

        return results;
    };
};
