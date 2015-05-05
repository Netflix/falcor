module.exports = set_and_verify_json_sparse;

var _ = require("lodash");
var verify = require("./verify");
var set_pathvalues = require("./set-pathvalues");
var set_pathmaps = require("./set-pathmaps");
var clone = require("./clone");
var sort_path_values = require("./sort-path-values");

function set_and_verify_json_sparse(test, suffix, pathvalues, options) {
    var pv_options = clone(options || {});
    if(pv_options.model) {
        pv_options.model = pv_options.model.
            boxValues().
            materialize().
            treatErrorsAsValues();
    } else {
        pv_options = {
            boxed: true,
            materialized: true,
            treatErrorsAsValues: true
        };
    }
    var set_tuple = set_pathvalues(pathvalues, "PathMap", pv_options);
    var pathmaps  = set_tuple[1].values.map(function(container) {
        return { json: container.json };
    });
    return verify(suffix).
        apply(test, set_pathmaps(pathmaps, suffix, clone(options))).
        apply(test, pathmaps);
}

function get_paths(values) {
    return values.map(function(pv) {
        return JSON.parse(JSON.stringify(pv.path));
    });
}

