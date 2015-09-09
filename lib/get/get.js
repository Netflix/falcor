var getBoundValue = require("./../get/getBoundValue");

module.exports = function get(walk, isJSONG) {
    return function innerGet(model, paths, seed) {
        var valueNode = seed[0];
        var results = {
            values: seed,
            optimizedPaths: []
        };
        var cache = model._root.cache;
        var boundPath = model._path;
        var currentCachePosition = cache;
        var optimizedPath;

        // If the model is bound, then get that cache position.
        if (boundPath.length) {
            if (isJSONG) {
                throw new Error("It is not legal to use the JSON Graph " +
                                "format from a bound Model. JSON Graph format" +
                                " can only be used from a root model.");
            }
            var boundValue = getBoundValue(model, boundPath);
            currentCachePosition = boundValue.value;
            optimizedPath = boundValue.path;
        }

        // Update the optimized path if we
        else {
            optimizedPath = [];
        }

        var optimizedLength = optimizedPath.length;
        for (var i = 0, len = paths.length; i < len; i++) {
            walk(model, cache, currentCachePosition, paths[i], 0,
                 valueNode, results, [], optimizedPath,
                 optimizedLength, isJSONG);
        }
        return results;
    };
};
