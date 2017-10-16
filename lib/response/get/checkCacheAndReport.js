var gets = require("./../../get");
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = gets.getWithPathsAsPathMap;

/**
 * Checks cache for the paths and reports if in progressive mode.  If
 * there are missing paths then return the cache hit results.
 *
 * Return value (`results`) stores missing path information as 3 index-linked arrays:
 * `requestedMissingPaths` holds requested paths that were not found in cache
 * `optimizedMissingPaths` holds optimized versions of requested paths
 * `depthDifferences` holds the difference in length of requested and optimized paths
 *
 * Note that requestedMissingPaths is not necessarily the list of paths requested by
 * user in model.get. It does not contain those paths that were found in
 * cache. It also breaks some path sets out into separate paths, those which
 * resolve to different optimized lengths after walking through any references in
 * cache.
 * This helps maintain a 1:1 correspondence between requested and optimized missing,
 * as well as their depth differences (or, length offsets).
 *
 * Example: Given cache: `{ lolomo: { 0: $ref('vid'), 1: $ref('a.b.c.d') }}`,
 * `model.get('lolomo[0..2].name').subscribe()` will result in the following
 * corresponding values:
 *    index   requestedMissingPaths   optimizedMissingPaths         depthDifferences
 *      0     ['lolomo', 0, 'name']   ['vid', 'name']                   1
 *      1     ['lolomo', 1, 'name']   ['a', 'b', 'c', 'd', 'name']     -2
 *      2     ['lolomo', 2, 'name']   ['lolomo', 2, 'name']             0
 *
 * @param {Model} model - The model that the request was made with.
 * @param {Array} requestedMissingPaths -
 * @param {Boolean} progressive -
 * @param {Boolean} isJSONG -
 * @param {Function} onNext -
 * @param {Function} onError -
 * @param {Function} onCompleted -
 * @param {Object} seed - The state of the output
 * @returns {Object} results -
 *
 * @private
 */
module.exports = function checkCacheAndReport(model, requestedPaths, observer,
                                              progressive, isJSONG, seed,
                                              errors) {

    // checks the cache for the data.
    var results = isJSONG ? getWithPathsAsJSONGraph(model, requestedPaths, seed)
                          : getWithPathsAsPathMap(model, requestedPaths, seed);

    // We are done when there are no missing paths or the model does not
    // have a dataSource to continue on fetching from.
    var valueNode = results.values && results.values[0];

    var completed = !results.requestedMissingPaths ||
                    !results.requestedMissingPaths.length ||
                    !model._source;

    // Copy the errors into the total errors array.
    if (results.errors) {
        var errs = results.errors;
        var errorsLength = errors.length;
        for (var i = 0, len = errs.length; i < len; ++i, ++errorsLength) {
            errors[errorsLength] = errs[i];
        }
    }

    // If there are values to report, then report.
    // Which are under two conditions:
    // 1.  This request is progressive
    //
    // 2.  The request if finished and the json key off
    // the valueNode has a value.
    if (progressive || ((progressive && results.hasValues || !progressive) && completed && valueNode !== undefined)) {
        try {
            observer.onNext(valueNode);
        } catch (e) {
            throw e;
        }
    }

    // We must communicate critical errors from get that are critical
    // errors such as bound path is broken or this is a JSONGraph request
    // with a bound path.
    if (results.criticalError) {
        observer.onError(results.criticalError);
        return null;
    }

    // if there are missing paths, then lets return them.
    if (completed) {
        if (errors.length) {
            observer.onError(errors);
        } else {
            observer.onCompleted();
        }

        return null;
    }

    // Return the results object.
    return results;
};
