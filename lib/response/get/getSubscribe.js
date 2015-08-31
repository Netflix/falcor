var gets = require("./../../get");
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = gets.getWithPathsAsPathMap;
var getRequestCycle = require('./getRequestCycle');
var checkCacheAndReport = require('./checkCacheAndReport');
var empty = function() {};

/**
 * creates the subscribe function for the ModelResponse and
 * a get request.
 * @private
 */
module.exports = function getSubscribe(model, requestedPaths) {
    return function(observer) {
        return _getSubscribe(model, requestedPaths, observer);
    };
};

// Performs the actual getSubscribe life cycle
function _getSubscribe(model, requestedPaths, observer) {
    var seed = [{}];
    var errors = [];
    var isJSONG = observer.isJSONG = observer.outputFormat === "AsJSONG";
    var isProgressive = observer.isProgressive;
    var results = checkCacheAndReport(model, requestedPaths, observer,
                                      isProgressive, isJSONG, seed, errors);

    // If there are no results, finish.
    if (!results) {
        return empty;
    }

    // Starts the async request cycle.
    return getRequestCycle(model, results, observer, seed, errors, 1);
}
