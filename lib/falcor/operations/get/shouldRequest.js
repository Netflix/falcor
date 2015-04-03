module.exports = function(model, combinedResults) {
    return model._dataSource && combinedResults.requestedMissingPaths.length > 0;
};
