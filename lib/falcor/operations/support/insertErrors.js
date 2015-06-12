/**
 * will insert the error provided for every requestedPath.
 * @param {Model} model
 * @param {Array.<Array>} requestedPaths
 * @param {Object} err
 */
var emptyArray = new Array(0);
module.exports = function insertErrors(model, requestedPaths, err, options) {
    var boundPath = model._path;
    model._path = emptyArray;
    var out = model._setPathSetsAsJSON.apply(null, [model].concat(
        requestedPaths.
            reduce(function(acc, r) {
                acc[0].push({ path: r, value: err });
                return acc;
            }, [[]]),
        [[]],
        options.errorSelector || model._errorSelector,
        options.comparator || model._comparator
    ));
    model._path = boundPath;
    return out.errors;
};

