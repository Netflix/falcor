var getSourceObserver = require('./../support/getSourceObserever');
/**
 * Performs a set on the model source.  I have chosen to use a callback for the sake of
 * simplicity in the code.
 * If performance in the future is relaxed i would like to see Rx.
 * @param {Model} model
 * @param {{jsong: {}, paths: []}} jsongEnv
 * @param {Function} cb
 */
function setSourceRequest(model, jsongEnv, cb) {
    return model._request.set(
        jsongEnv,
        getSourceObserver(model, jsongEnv.paths, cb));
}

module.exports = setSourceRequest;
