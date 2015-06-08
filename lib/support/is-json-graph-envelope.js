var is_array = Array.isArray;
var is_object = require("falcor/support/is-object");

module.exports = function is_json_graph_envelope(envelope) {
    return is_object(envelope) && is_array(envelope.paths) && (
        is_object(envelope.jsonGraph) ||
        is_object(envelope.jsong)     ||
        is_object(envelope.json)      ||
        is_object(envelope.values)    ||
        is_object(envelope.value)
    );
};