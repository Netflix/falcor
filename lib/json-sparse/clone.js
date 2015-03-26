var $sentinel = "sentinel";
var clone = require("../support/clone");
module.exports = function(roots, node, type, value) {
    var json;
    if(node == null || value === undefined) {
        json = { $type: $sentinel };
    } else if(roots.boxed == true) {
        json = clone(node);
    } else if(type != $sentinel) {
        json = clone(node);
    } else {
        json = value;
    }
    return json;
}
