module.exports = set_pathvalues;

var _ = require("lodash");
var jsong = require("../../../index");
var Model = jsong.Model;
var partial_cache = require("./partial-cache");
var get_seeds = require("./get-seeds");

function set_pathvalues(pathvalues, suffix, options) {
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

