var isObject = require("./../support/is-object");

module.exports = function isJsonGraphEnvelope(envelope) {
    return isObject(envelope) && ("json" in envelope);
};
