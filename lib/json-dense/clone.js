var $sentinel = "sentinel";
var clone = require("../support/clone");
module.exports = function(roots, node, type, value) {
    var json;
    if(node == null) {
        if(roots.materialized == true) {
            json = { $type: $sentinel };
        }
    } else if(roots.boxed == true) {
        json = clone(node);
    } else if(value === undefined && roots.materialized == true) {
        json = clone(node);
    } else {
        json = value;
    }
    return json;
}
