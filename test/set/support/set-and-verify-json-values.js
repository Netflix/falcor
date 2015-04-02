module.exports = set_and_verify_json_values;

var _ = require("lodash");
var jsong = require("../../../index");
var Model = jsong.Model;
var partial_cache = require("./partial-cache");
var verify = require("./verify");

function set_and_verify_json_values(test, suffix, pathvalues, options) {
    return verify(suffix).
        apply(test, set_path_values(pathvalues, suffix, options)).
        apply(test, get_paths(pathvalues));
}

function set_path_values(pathvalues, suffix, options) {
    var model   = options && options.model || new Model(_.extend({ cache: partial_cache() }, options || {}));
    var seeds   = suffix == "JSON" ? get_seeds(pathvalues) : [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_setPathSetsAs" + suffix];
    var results = func(model, pathvalues, seeds);
    if(values) { results.values = values; }
    return [model, results];
}

function get_seeds(pathvalues) {
    return pathvalues.map(function() {
        return {};
    });
}

function get_paths(values) {
    return values.map(function(pv) {
        return JSON.parse(JSON.stringify(pv.path));
    });
}

