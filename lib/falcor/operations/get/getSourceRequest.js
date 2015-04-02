var getSourceObserver = require('./../support/getSourceObserever');
/**
 * Performs a get on the model source.  I have chosen to use a callback for the sake of
 * simplicity in the code.
 * If performance in the future is relaxed i would like to see Rx.
 * @param {Model} model
 * @param {Array.<Array>} requestedMissingPaths
 * @param {Array.<Array>} optimizedMissingPaths
 * @param {Function} cb
 */
function getSourceRequest(model, requestedMissingPaths, optimizedMissingPaths, cb) {
    return model._request.get(
        requestedMissingPaths,
        optimizedMissingPaths,
        getSourceObserver(model, requestedMissingPaths, cb));
}

module.exports = getSourceRequest;
