var getSourceObserver = require('./../support/getSourceObserever');
var partitionOperations = require('./../support/partitionOperations');
var mergeBoundPath = require('./../support/mergeBoundPath');

module.exports = getSourceRequest;

function getSourceRequest(
        options, onNext, seeds, relativeSeeds, combinedResults, cb) {

    var missingPaths = combinedResults.requestedMissingPaths;
    var model = options.model;
    return model._request.get(
        missingPaths,
        combinedResults.optimizedMissingPaths,
        getSourceObserver(model, missingPaths, function(err, results) {
            if (err) {
                cb(err);
            }
            results.paths = mergeBoundPath(model, results);

            // partitions the operations by their pathSetIndex
            var partitionOperationsAndSeeds = partitionOperations(
                results,
                missingPaths,
                options.format,
                relativeSeeds,
                onNext);
            cb(null, partitionOperationsAndSeeds);
        }));
}

