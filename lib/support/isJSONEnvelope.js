var isObject = require("./../support/isObject");

module.exports = function isJSONGraphEnvelope(envelope) {
    return isObject(envelope) && ("json" in envelope);
};
