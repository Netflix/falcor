var getSourceObserver = require('./../support/getSourceObserever');
var partitionOperations = require('./../support/partitionOperations');
var mergeBoundPath = require('./../support/mergeBoundPath');

module.exports = getSourceRequest;

function getSourceRequest(
    options, onNext, seeds, combinedResults, requestOptions, cb) {

    var model = options.operationModel;
    var boundPath = model._path;
    var missingPaths = combinedResults.requestedMissingPaths;
    if (boundPath.length) {
        for (var i = 0; i < missingPaths.length; ++i) {
            var pathSetIndex = missingPaths[i].pathSetIndex;
            var path = missingPaths[i] = boundPath.concat(missingPaths[i]);
            path.pathSetIndex = pathSetIndex;
        }
    }

    return model._request.get(
        missingPaths,
        combinedResults.optimizedMissingPaths,
        getSourceObserver(
            model,
            missingPaths,
            function getSourceCallback(err, results) {
                if (err) {
                    cb(err);
                    return;
                }

                // partitions the operations by their pathSetIndex
                var partitionOperationsAndSeeds = partitionOperations(
                    results,
                    seeds,
                    options.format,
                    onNext);

                // We allow for the rerequesting to happen.
                cb(null, partitionOperationsAndSeeds);
            }, options));
}

