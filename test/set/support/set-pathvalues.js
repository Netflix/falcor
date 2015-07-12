module.exports = set_pathvalues;

var _ = require("lodash");
var falcor = require("./../../../lib/");
var Model = falcor.Model;
var partial_cache = require("./partial-cache");
var get_seeds = require("./get-seeds");
var sort_path_values = require("./sort-path-values");

function set_pathvalues(pathvalues, suffix, options) {
    var model   = options && options.model || new Model(_.extend({ cache: partial_cache() }, options || {}));
    var seeds   = suffix == "JSON" ? get_seeds(pathvalues) : [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_setPathSetsAs" + suffix];
    var results = func(model, pathvalues, seeds);
    if(values) { results.values = values.sort(sort_path_values); }
    else if(suffix == "JSONG") {
        results.values.forEach(function(envelope) {
            envelope.paths.sort(sort_path_values);
        });
    }
    results.requestedPaths.sort(sort_path_values);
    results.optimizedPaths.sort(sort_path_values);
    results.requestedMissingPaths.sort(sort_path_values);
    results.optimizedMissingPaths.sort(sort_path_values);
    
    return [model, results];
}

