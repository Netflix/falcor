var ModelResponse = require("./../ModelResponse");
var checkCacheAndReport = require("./checkCacheAndReport");
var getRequestCycle = require("./getRequestCycle");
var empty = {dispose: function() {}};
var Observable = require("rx/dist/rx").Observable;

/**
 * The get response.  It takes in a model and paths and starts
 * the request cycle.  It has been optimized for cache first requests
 * and closures.
 * @param {Model} model -
 * @param {Array} paths -
 * @private
 */
var GetResponse = module.exports = function GetResponse(model, paths,
                                                        isJSONGraph,
                                                        isProgressive) {
    this.model = model;
    this.currentRemainingPaths = paths;
    this.isJSONGraph = isJSONGraph || false;
    this.isProgressive = isProgressive || false;
};

GetResponse.prototype = Object.create(Observable.prototype);

// becomes a subscribable/thenable from ModelResponse.
GetResponse.prototype.subscribe = ModelResponse.prototype.subscribe;
GetResponse.prototype.then = ModelResponse.prototype.then;

/**
 * Makes the output of a get response JSONGraph instead of json.
 * @private
 */
GetResponse.prototype._toJSONG = function _toJSONGraph() {
    return new GetResponse(this.model, this.currentRemainingPaths,
                           true, this.isProgressive);
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
GetResponse.prototype.progressively = function progressively() {
    return new GetResponse(this.model, this.currentRemainingPaths,
                           this.isJSONGraph, true);
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
