// Set differs from get in the sense that the first time through
// the recurse loop a server operation must be performed if it can be.
module.exports = function(model, combinedResults, loopCount) {
    if (loopCount > 50) {
        throw 'Loop Kill switch thrown.';
    }
    return model._dataSource && (
        combinedResults.requestedMissingPaths.length > 0 ||
        loopCount === 0);
};
