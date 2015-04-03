module.exports = get_pathsets;

var get_seeds = require("./get-seeds");

function get_pathsets(model, paths, suffix) {
    var seeds   = suffix == "JSON" ? get_seeds(paths) : [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_getPathSetsAs" + suffix];
    var output = func(model, paths, seeds);
    if(values) { output.values = values; }
    return output;
};
