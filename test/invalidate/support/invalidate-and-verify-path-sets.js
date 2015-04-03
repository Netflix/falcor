module.exports = invalidate_and_verify_path_sets;

var _ = require("lodash");
var jsong = require("../../../index");
var Model = jsong.Model;
var whole_cache = require("../../set/support/whole-cache");
var verify = require("./verify");

function invalidate_and_verify_path_sets(test, suffix, pathsets, options) {
    return verify(suffix).
        apply(test, invalidate_path_sets(pathsets, suffix, options)).
        apply(test, get_paths(pathsets));
}

function invalidate_path_sets(pathsets, suffix, options) {
    var model   = options && options.model || new Model(_.extend({ cache: whole_cache() }, options || {}));
    var seeds   = suffix == "JSON" ? get_seeds(pathsets) : [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_invPathSetsAs" + suffix];
    var results = func(model, pathsets, seeds);
    if(values) { results.values = values; }
    return [model, results];
}

function get_seeds(pathsets) {
    return pathsets
        .slice(0, Math.ceil(pathsets.length / 2))
        .map(function() { return {}; });
}

function get_paths(pathsets) {
    return pathsets.map(function(pathset) {
        return JSON.parse(JSON.stringify(pathset));
    });
}

