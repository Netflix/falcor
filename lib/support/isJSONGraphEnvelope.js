var isArray = Array.isArray;
var isObject = require("./../support/isObject");

module.exports = function isJSONGraphEnvelope(envelope) {
    return isObject(envelope) && isArray(envelope.paths) && (
        isObject(envelope.jsonGraph) ||
        isObject(envelope.jsong) ||
        isObject(envelope.json) ||
        isObject(envelope.values) ||
        isObject(envelope.value)
    );
};
