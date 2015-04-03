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
    var check_set = verify(suffix);
    var set_tuple = set_envelopes(envelopes, suffix, options);
    var check_get = check_set.apply(test, set_tuple);
    var paths     = envelopes.flatMap(get_paths).map(slice_bound(set_tuple[0]))
    return check_get.apply(test, paths);
}

function get_paths(envelope) {
    return envelope.paths.map(function(path) {
        return JSON.parse(JSON.stringify(path));
    });
}

function slice_bound(model) {
    return function(path) {
        return path.slice(model._path.length);
    }
}