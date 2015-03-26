var $sentinel = "sentinel";
var clone = require("../support/clone");
var array_clone = require("../support/array-clone");
module.exports = function(roots, node, value, path) {
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
    
    return { path: array_clone(path), value: json };
}