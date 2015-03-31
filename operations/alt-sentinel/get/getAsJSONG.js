var getBoundValue = require('./getBoundValue');
module.exports = function(walk) {
    return function getAsJSONG(model, paths, values) {
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
        results.values = values;
        var cache = model._cache;
        var boundPath = model._path;
        var currentCachePosition;
        if (boundPath.length) {
            throw 'It is not legal to use the JSON Graph format from a bound Model. JSON Graph format can only be used from a root model.';
        } else {
            currentCachePosition = cache;
        }

        debugger;
        for (var i = 0, len = paths.length; i < len; i++) {
            walk(model, cache, currentCachePosition, paths[i], 0, values[0], [], results, [], [], inputFormat, 'JSONG');
        }
        return results;
    };
};

