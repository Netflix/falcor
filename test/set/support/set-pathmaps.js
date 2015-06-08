module.exports = set_pathmaps;

var _ = require("lodash");
var falcor = require("falcor");
var Model = falcor.Model;
var partial_cache = require("./partial-cache");
var get_seeds = require("./get-seeds");
var sort_path_values = require("./sort-path-values");

function set_pathmaps(pathmaps, suffix, options) {
    var model   = options && options.model || new Model(_.extend({ cache: partial_cache() }, options || {}));
    var seeds   = suffix == "JSON" ? get_seeds(pathmaps) : [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_setPathMapsAs" + suffix];
    var results = func(model, pathmaps, seeds);
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

