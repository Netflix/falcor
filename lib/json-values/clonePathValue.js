var clone = require("support/clone");
module.exports = function(opts, node, value, path) {
    var val = { path: path.slice(0) };
    if(opts.materialized === true) {
        if(node == null) {
            val.value = Object.create(null);
            val.value["$type"] = "sentinel";
        } else if(value === undefined) {
            val.value = clone(node);
        } else {
            val.value = clone(value);
        }
    } else if(opts.boxed === true) {
        val.value = clone(node);
    } else {
        val.value = clone(value);
    }
    return val;
}