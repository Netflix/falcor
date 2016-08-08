var walkPathAndBuildOutput = require("./walkPath");
var BoundJSONGraphModelError = require("./../../errors/BoundJSONGraphModelError");

module.exports = getJSONGraph;

function getJSONGraph(model, paths, values) {

    var node, cache,
        boundPath = model._path,
        modelRoot = model._root,
        requestedPath, requestedLength,
        optimizedPath, optimizedLength = boundPath.length;

    // If the model is bound, then get that cache position.
    if (optimizedLength) {
        // JSONGraph output cannot ever be bound or else it will
        // throw an error.
        return {
            criticalError: new BoundJSONGraphModelError()
        };
    } else {
        optimizedPath = [];
        cache = node = modelRoot.cache;
    }

    requestedPath = [];

    var boxValues = model._boxed,
        expired = modelRoot.expired,
        materialized = model._materialized,
        hasDataSource = Boolean(model._source),
        treatErrorsAsValues = model._treatErrorsAsValues,

        results = { values: values },
        path, depth = 0, seed = values[0],
        pathsIndex = -1, pathsCount = paths.length;

    while (++pathsIndex < pathsCount) {
        path = paths[pathsIndex];
        requestedLength = path.length;
        walkPathAndBuildOutput(cache, node, path,
                               depth, seed, results,
                               requestedPath, requestedLength,
                               optimizedPath, optimizedLength,
         /* fromReference = */ false, modelRoot, expired,
                               boxValues, materialized, hasDataSource,
                               treatErrorsAsValues);
    }

    return results;
}
