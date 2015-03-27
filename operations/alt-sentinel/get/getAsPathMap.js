var getBoundValue = require('./getBoundValue');
module.exports = function(walk) {
    return function getAsPathMap(model, paths, values) {
        var valueNode;
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
        valueNode = values[0];
        results.values = values;

        var cache = model._cache;
        var boundPath = model._path;
        var currentCachePosition;
        var optimizedPath;
        if (boundPath.length) {
            var boundValue = getBoundValue(model, boundPath);
            currentCachePosition = boundValue.value;
            optimizedPath = boundValue.path;
        } else {
            currentCachePosition = cache;
            optimizedPath = [];
        }

        for (var i = 0, len = paths.length; i < len; i++) {
            walk(model, cache, currentCachePosition, paths[i], 0, valueNode, [], results, optimizedPath, [], inputFormat, 'PathMap');
        }
        return results;
    };
};
