var ModelResponse = require('./../ModelResponse');
var checkCacheAndReport = require("./checkCacheAndReport");
var getRequestCycle = require("./getRequestCycle");
var empty = {dispose: function() {}};

/**
 * The get response.  It takes in a model and paths and starts
 * the request cycle.  It has been optimized for cache first requests
 * and closures.
 * @param {Model} model -
 * @param {Array} paths -
 * @private
 */
var GetResponse = module.exports = function GetResponse(model, paths) {
    this.model = model;
    this.currentRemainingPaths = paths;
};

GetResponse.prototype.subscribe = ModelResponse.prototype.subscribe;

/**
 * Makes the output of a get response JSONGraph instead of json.
 * @private
 */
GetResponse.prototype._toJSONG = function _toJSONGraph() {
    var nextResponse = new GetResponse(this.model, this.currentRemainingPaths);
    nextResponse.isJSONGraph = true;
    nextResponse.isProgressive = this.isProgressive;

    return nextResponse;
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
GetResponse.prototype.progressively = function progressively() {
    var nextResponse = new GetResponse(this.model, this.currentRemainingPaths);
    nextResponse.isJSONGraph = true;
    nextResponse.isProgressive = this.isProgressive;

    return nextResponse;
};

/**
 * purely for the purposes of closure creation other than the initial
 * prototype created closure.
 *
 * @private
 */
GetResponse.prototype._subscribe = function _subscribe(observer) {
    var seed = [{}];
    var errors = [];
    var isJSONG = observer.isJSONG = this.isJSONGraph;
    var isProgressive = this.isProgressive;
    var results = checkCacheAndReport(this.model, this.currentRemainingPaths,
                                      observer, isProgressive, isJSONG, seed,
                                      errors);

    // If there are no results, finish.
    if (!results) {
        return empty;
    }

    // Starts the async request cycle.
    return getRequestCycle(this, this.model, results,
                           observer, seed, errors, 1);
};
