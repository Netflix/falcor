var $sentinel = require("../types/$sentinel");
var clone = require("../support/clone");
var is_primitive = require("../support/is-primitive");
module.exports = function(roots, node, type, value) {
    var json;
    if(node == null || value === undefined) {
        json = { $type: $sentinel };
    } else if(roots.boxed == true) {
        json = clone(node);
    } else if(type == $sentinel) {
        if(is_primitive(value)) {
            json = value;
        } else {
            json = clone(node);
        }
    } else if(!!type) {
        json = clone(node);
    } else {
        json = value;
    }
    return json;
}