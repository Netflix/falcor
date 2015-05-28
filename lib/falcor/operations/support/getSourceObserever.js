var insertErrors = require('./insertErrors.js');
/**
 * creates the model source observer
 * @param {Model} model
 * @param {Array.<Array>} requestedMissingPaths
 * @param {Function} cb
 */
function getSourceObserver(model, requestedMissingPaths, cb, options) {
    var incomingValues;
    return {
        onNext: function(jsongEnvelop) {
            incomingValues = {
                jsong: jsongEnvelop.jsong,
                paths: requestedMissingPaths
            };
        },
        onError: function(err) {
            cb(insertErrors(model, requestedMissingPaths, err, options));
        },
        onCompleted: function() {
            cb(false, incomingValues);
        }
    };
}

module.exports = getSourceObserver;
