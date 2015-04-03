var getSourceObserver = require('./../support/getSourceObserever');
var partitionOperations = require('./../support/partitionOperations');
var mergeBoundPath = require('./../support/mergeBoundPath');

module.exports = getSourceRequest;

function getSourceRequest(model, args, seeds, format, selector, onNext) {
    return function innerModelSourceRequest(relativeSeeds, combinedResults, cb) {
        var missingPaths = combinedResults.requestedMissingPaths;
        return model._request.get(
            missingPaths,
            combinedResults.optimizedMissingPaths,
            getSourceObserver(model, missingPaths, function(err, results) {
                if (err) {
                    cb(err);
                }
                debugger;
                results.paths = mergeBoundPath(model, results);

                // partitions the operations by their pathSetIndex
                var partitionOperationsAndSeeds = partitionOperations(
                    results,
                    missingPaths,
                    format,
                    relativeSeeds,
                    onNext);
                cb(null, partitionOperationsAndSeeds);
            }));
    };
}

