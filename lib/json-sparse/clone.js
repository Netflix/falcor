var $sentinel = "sentinel";
var clone = require("../support/clone");
var is_object = require("../support/is-object");
module.exports = function(roots, node, type, value) {
    var json;
    if(node == null) {
        if(roots.materialized == true) {
            json = { $type: $sentinel };
        }
    } else if(value === undefined) {
        if(roots.materialized == true) {
            json = clone(node);
        }
    } else if(roots.boxed == true) {
        json = clone(node);
    } else if(type != $sentinel) {
        json = clone(node);
    } else {
        json = value;
    }
    return json;
}