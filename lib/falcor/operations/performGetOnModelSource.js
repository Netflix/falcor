var insertErrors = require('./insertErrors.js');
/**
 * Performs a get on the model source.  I have chosen to use a callback for the sake of
 * simplicity in the code.
 * If performance in the future is relaxed i would like to see Rx.
 * @param {Model} model
 * @param {Array.<Array>} requestedMissingPaths
 * @param {Array.<Array>} optimizedMissingPaths
 * @param {Function} cb
 */
function performGetOnModelSource(model, requestedMissingPaths, optimizedMissingPaths, cb) {
    var incomingValues;
    var observer = {
        onNext: function(jsongEnvelop) {
            incomingValues = {
                jsong: jsongEnvelop.jsong,
                paths: requestedMissingPaths
            };
        },
        onError: function(err) {
            cb(insertErrors(model, requestedMissingPaths, err));
        },
        onCompleted: function() {
            cb(false, incomingValues);
        }
    };
    model._request.get(requestedMissingPaths, optimizedMissingPaths, observer);
}

module.exports = performGetOnModelSource;
