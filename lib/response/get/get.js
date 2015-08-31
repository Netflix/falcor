/**
 * The get request cycle for checking the cache and reporting
 * values.  If there are missing paths then the async request cycle to
 * the data source is performed until all paths are resolved or max
 * requests are made.
 * @param {Model} model - The model that the request was made with.
 * @param {Boolean} progressive - if the output should be progressive or not.
 * @param {Boolean} isJSONG - if the output format is JSONG or not.
 * @param {Function} onNext -
 * @param {Function} onError -
 * @param {Function} onCompleted -
 * @param {Object} seedArg - The state of the output
 * @private
 */
module.exports = function getRequestCycle(model, progressive, isJSONG,
                                          onNext, onError, onCompleted, seedArg) {
    var seed = seedArg || [{}];
    var requestQueue = model._request;
};
