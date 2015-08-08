module.exports = get_pathsets;

var get_seeds = require("./get-seeds");
var sort_path_values = require("./sort-path-values");

function get_pathsets(model, paths, suffix) {
    var seeds   = suffix == "JSON" ? get_seeds(paths) : [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_getPathValuesAs" + suffix];
    var output = func(model, paths, seeds);
    if(values) { output.values = values.sort(sort_path_values); }
    else if(suffix == "JSONG") {
        output.values.forEach(function(envelope) {
            envelope.paths.sort(sort_path_values);
        });
    }
    output.requestedPaths.sort(sort_path_values);
    output.optimizedPaths.sort(sort_path_values);
    output.requestedMissingPaths.sort(sort_path_values);
    output.optimizedMissingPaths.sort(sort_path_values);
    return output;
};
