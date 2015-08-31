var checkCacheAndReport = require('./checkCacheAndReport');
var MaxRetryExceededError = require('./../../errors/MaxRetryExceededError');
var fastCat = require('./../../get/util/support').fastCat;

/**
 * The get request cycle for checking the cache and reporting
 * values.  If there are missing paths then the async request cycle to
 * the data source is performed until all paths are resolved or max
 * requests are made.
 * @param {Model} model - The model that the request was made with.
 * @param {Object} results -
 * @param {Function} onNext -
 * @param {Function} onError -
 * @param {Function} onCompleted -
 * @param {Object} seedArg - The state of the output
 * @private
 */
module.exports = function getRequestCycle(model, results, observer,
                                          seed, errors, count) {
    // we have exceeded the maximum retry limit.
    if (count === 10) {
        throw new MaxRetryExceededError();
    }

    var requestQueue = model._request;
    var disposed = false;
    var requestedMissingPaths = results.requestedMissingPaths;
    var optimizedMissingPaths = results.optimizedMissingPaths;

    // We need to prepend the bound path to all requested missing paths and
    // pass those into the requestQueue.
    var boundRequestedMissingPaths = [];
    var boundPath = model._path;
    for (var i = 0, len = requestedMissingPaths.length; i < len; ++i) {
        boundRequestedMissingPaths[i] =
            fastCat(boundPath, requestedMissingPaths[i]);
    }

    var currentRequestDisposable = requestQueue.
        get(boundRequestedMissingPaths, optimizedMissingPaths, function() {


            // Once the request queue finishes, check the cache and bail if
            // we can.
            var results = checkCacheAndReport(model, requestedMissingPaths,
                                              observer, observer.isProgressive,
                                              observer.isJSONG, seed, errors);

            // If there are missing paths coming back form checkCacheAndReport
            // the its reported from the core cache check method.
            if (results) {
                currentRequestDisposable = getRequestCycle(model, results,
                                                           observer, seed,
                                                           errors, count + 1);
            }
        });

    // The disposing of the getRequestCycle.
    return function getRequestCycleDispose() {
        if (disposed) {
            return;
        }

        disposed = true;
        currentRequestDisposable();
    };
};
