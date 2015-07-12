module.exports = invalidate_and_verify_json_sparse;

var _ = require("lodash");
var falcor = require("./../../../lib/");
var Model = falcor.Model;
var whole_cache = require("../../set/support/whole-cache");
var verify = require("./verify");

function invalidate_and_verify_json_sparse(test, suffix, pathsets, options) {

    var pathmaps = [{}];

    var model = new Model({
        boxed: true,
        materialized: true,
        treatErrorsAsValues: true
    });

    model._setPathValuesAsPathMap(model, pathsets.map(function(path) {
        return { path: path, value: true };
    }), pathmaps);

    return verify(suffix).
        apply(test, invalidate_path_maps(pathmaps, suffix, options)).
        apply(test, pathmaps);
}

function invalidate_path_maps(pathmaps, suffix, options) {
    var model   = options && options.model || new Model(_.extend({ cache: whole_cache() }, options || {}));
    var seeds   = [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_invalidatePathMapsAs" + suffix];
    var results = func(model, pathmaps, seeds);
    if(values) { results.values = values; }
    return [model, results];
}
