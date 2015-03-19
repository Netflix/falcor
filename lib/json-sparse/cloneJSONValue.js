var isArray = Array.isArray;
var clone = require("support/clone");
module.exports = function(opts, node, value) {
    var json;
    if(opts.materialized === true) {
        if(node == null) {
            json = Object.create(null);
            json["$type"] = "sentinel";
        } else if(value === undefined) {
            json = clone(node);
        } else {
            json = clone(value);
            if(json != null && typeof json == "object" && !isArray(json)) {
                json["$type"] = "group";
            }
        }
    } else if(opts.boxed === true) {
        json = clone(node);
    } else if(opts.errorsAsValues || (node && node.$type != "error")) {
        if(node != null) {
            json = clone(value);
            if(json != null && typeof json == "object" && !isArray(json)) {
                json["$type"] = "group";
            }
        }
    }
    return json;
}