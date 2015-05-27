/**
 * will insert the error provided for every requestedPath.
 * @param {Model} model
 * @param {Array.<Array>} requestedPaths
 * @param {Object} err
 */
module.exports = function insertErrors(model, requestedPaths, err, options) {
    var out = model._setPathSetsAsJSON.apply(null, [model].concat(
        requestedPaths.
            reduce(function(acc, r) {
                acc[0].push({
                    path: r,
                    value: err
                });
                return acc;
            }, [[]]),
        [[]],
        options.errorSelector || model._errorSelector,
        options.comparator || model._comparator
    ));
    return out.errors;
};

