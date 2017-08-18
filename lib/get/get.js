var getCachePosition = require("./../get/getCachePosition");
var InvalidModelError = require("./../errors/InvalidModelError");
var BoundJSONGraphModelError = require("./../errors/BoundJSONGraphModelError");

function mergeInto(target, obj) {
    /* eslint guard-for-in: 0 */
    if (target === obj) {
        return;
    }
    if (target === null || typeof target !== "object" || target.$type) {
        return;
    }
    if (obj === null || typeof obj !== "object" || obj.$type) {
        return;
    }

    for (var key in obj) {
        // When merging over a temporary branch structure (for example, as produced by an error selector)
        // with references, we don't want to mutate the path, particularly because it's also $_absolutePath
        // on cache nodes
        if (key === "$__path") {
            continue;
        }

        var targetValue = target[key];
        if (targetValue === undefined) {
            target[key] = obj[key];
        } else {
            mergeInto(targetValue, obj[key]);
        }
    }
}

module.exports = function get(walk, isJSONG) {
    return function innerGet(model, paths, seed) {
        // Result valueNode not immutable for isJSONG.
        var nextSeed = isJSONG ? seed : [{}];
        var valueNode = nextSeed[0];
        var results = {
            values: nextSeed,
            optimizedPaths: []
        };
        var cache = model._root.cache;
        var boundPath = model._path;
        var currentCachePosition = cache;
        var optimizedPath, optimizedLength = boundPath.length;
        var i, len;
        var requestedPath = [];
        var derefInfo = [];
        var referenceContainer;

        // If the model is bound, then get that cache position.
        if (optimizedLength) {

            // JSONGraph output cannot ever be bound or else it will
            // throw an error.
            if (isJSONG) {
                return {
                    criticalError: new BoundJSONGraphModelError()
                };
            }
            currentCachePosition = getCachePosition(model, boundPath);

            // If there was a short, then we 'throw an error' to the outside
            // calling function which will onError the observer.
            if (currentCachePosition && currentCachePosition.$type) {
                return {
                    criticalError: new InvalidModelError(boundPath, boundPath)
                };
            }

            // We need to get the new cache position and copy the bound
            // path.
            optimizedPath = [];
            for (i = 0; i < optimizedLength; ++i) {
                optimizedPath[i] = boundPath[i];
            }
            referenceContainer = model._referenceContainer;
        }

        // Update the optimized path if we
        else {
            optimizedPath = [];
            optimizedLength = 0;
        }

        for (i = 0, len = paths.length; i < len; i++) {
            walk(model, cache, currentCachePosition, paths[i], 0,
                 valueNode, results, derefInfo, requestedPath, optimizedPath,
                 optimizedLength, isJSONG, false, referenceContainer);
        }

        // Merge in existing results.
        mergeInto(valueNode, seed[0]);

        return results;
    };
};
