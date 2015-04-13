// Set differs from get in the sense that the first time through
// the recurse loop a server operation must be performed if it can be.
module.exports = function(model, combinedResults, loopCount) {
    return model._dataSource && (
        combinedResults.requestedMissingPaths.length > 0 ||
        loopCount === 0);
};
