module.exports = set_envelopes;

var _ = require("lodash");
var jsong = require("../../../index");
var Model = jsong.Model;
var partial_cache = require("./partial-cache");
var get_seeds = require("./get-seeds");

function set_envelopes(envelopes, suffix, options) {
    var model   = options && options.model || new Model(_.extend({ cache: partial_cache() }, options || {}));
    var seeds   = suffix == "JSON" ? get_seeds(envelopes.flatMap(get_paths)) : [{}];
    if(suffix == "JSONG") {
        model._path = [];
    } else if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_setJSONGsAs" + suffix];
    var results = func(model, envelopes, seeds);
    if(values) { results.values = values; }
    
    return [model, results];
}

function get_paths(envelope) {
    return envelope.paths.map(function(path) {
        return JSON.parse(JSON.stringify(path));
    });
}
