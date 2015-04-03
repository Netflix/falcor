module.exports = set_and_verify_json_values;

var verify = require("./verify");
var set_pathvalues = require("./set-pathvalues");

function set_and_verify_json_values(test, suffix, pathvalues, options) {
    return verify(suffix).
        apply(test, set_pathvalues(pathvalues, suffix, options)).
        apply(test, get_paths(pathvalues));
}

function get_paths(values) {
    return values.map(function(pv) {
        return JSON.parse(JSON.stringify(pv.path));
    });
}

