var clone = require("../support/clone");
module.exports = function(opts, node, type, value) {
    var json;
    if(node == null) {
        if(opts.materialized == true) {
            json = Object.create(null);
            json.$type = "sentinel";
        }
    } else if(value === undefined) {
        if(opts.materialized == true) {
            json = clone(node);
        }
    } else if(opts.boxed == true) {
        json = clone(node);
    } else if(type == "reference" || type == "error") {
        json = clone(node);
    } else if(value != null && typeof value == "object") {
        json = clone(node);
    } else {
        json = value;
    }
    return json;
}