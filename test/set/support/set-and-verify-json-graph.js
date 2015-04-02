module.exports = set_and_verify_json_graph;

Array.prototype.flatMap = function(selector) {
    return this.reduce(function(xs, x, i, a){
        return xs.concat(selector(x, i, a));
    }, []);
};

var _ = require("lodash");
var jsong = require("../../../index");
var Model = jsong.Model;
var partial_cache = require("./partial-cache");
var verify = require("./verify");
var set_envelopes = require("./set-envelopes");

function set_and_verify_json_graph(test, suffix, envelopes, options) {
    return verify(suffix).
        apply(test, set_envelopes(envelopes, suffix, options)).
        apply(test, envelopes.flatMap(get_paths));
}

function get_paths(envelope) {
    return envelope.paths.map(function(path) {
        return JSON.parse(JSON.stringify(path));
    });
}

function get_seeds(pathvalues) {
    return pathvalues.map(function() {
        return {};
    });
}
