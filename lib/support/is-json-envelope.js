var is_object = require("./../support/is-object");

module.exports = function is_json_graph_envelope(envelope) {
    return is_object(envelope) && ("json" in envelope);
};