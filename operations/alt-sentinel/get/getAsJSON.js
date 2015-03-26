var getBoundValue = require('./getBoundValue');
module.exports = function(walk) {
    return function getAsJSON(model, paths, values) {
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
        if (values) {
            results.values = values;
        } else {
            values = [];
        }
        var cache = model._cache;
        var boundPath = model._path;
        var currentCachePosition;
        if (boundPath.length) {
            currentCachePosition = getBoundValue(model, boundPath).value;
        } else {
            currentCachePosition = cache;
        }

        for (var i = 0, len = paths.length; i < len; i++) {
            var valueNode;
            if (values[i]) {
                valueNode = values[i];
            }
            walk(model, cache, currentCachePosition, paths[i], 0, valueNode, [], results, [], [], inputFormat, 'JSON');
        }

        if (results.requestedPaths.length === 0) {
            results.values = [null];
        }
        return results;
    };
};

