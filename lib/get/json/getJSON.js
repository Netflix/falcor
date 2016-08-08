var walkPathAndBuildOutput = require("./walkPath");
var getCachePosition = require("./../getCachePosition");
var InvalidModelError = require("./../../errors/InvalidModelError");

module.exports = getJSON;

function getJSON(model, paths, values) {

    var node,
        referenceContainer,
        boundPath = model._path,
        modelRoot = model._root,
        cache = modelRoot.cache,
        requestedPath, requestedLength,
        optimizedPath, optimizedLength = boundPath.length;

    // If the model is bound, get the cache position.
    if (optimizedLength) {
        node = getCachePosition(cache, boundPath);
        // If there was a short, then we 'throw an error' to the outside
        // calling function which will onError the observer.
        if (node.$type) {
            return {
                criticalError: new InvalidModelError(boundPath, boundPath)
            };
        }
        // We need to get the new cache position and copy the bound path.
        optimizedPath = [];
        for (var i = 0; i < optimizedLength; ++i) {
            optimizedPath[i] = boundPath[i];
        }
        referenceContainer = model._referenceContainer;
    } else {
        node = cache;
        optimizedPath = [];
    }

    requestedPath = [];

    var boxValues = model._boxed,
        expired = modelRoot.expired,
        materialized = model._materialized,
        hasDataSource = Boolean(model._source),
        branchSelector = modelRoot.branchSelector,
        treatErrorsAsValues = model._treatErrorsAsValues,
        allowFromWhenceYouCame = model._allowFromWhenceYouCame,

        seed = values[0],
        json = seed && seed.json,
        results = { values: values },
        path, depth = 0, nodeKey = "json",
        //          pass ^ this in to walkPathAndBuildOutput so we
        //          have a key to use for hashing the first JSON branch.
        pathsIndex = -1, pathsCount = paths.length;


    while (++pathsIndex < pathsCount) {
        path = paths[pathsIndex];
        requestedLength = path.length;
        json = walkPathAndBuildOutput(cache, node, json, path,
                                      depth, nodeKey, seed, results,
                                      requestedPath, requestedLength,
                                      optimizedPath, optimizedLength,
                         /* fromReference = */ false, referenceContainer,
                                      modelRoot, expired, branchSelector,
                                      boxValues, materialized, hasDataSource,
                                      treatErrorsAsValues, allowFromWhenceYouCame);
    }

    if (results.hasValue) {
        seed.json = json;
    }

    return results;
}
