var $sentinel = require("../types/$sentinel");
var clone = require("./clone");
var is_primitive = require("./is-primitive");
module.exports = function(roots, node, type, value) {
    
    if(node == null || value === undefined) {
        return { $type: $sentinel };
    }
    
    if(roots.boxed == true) {
        return !!type && clone(node) || node;
    }
    
    if(!type || (type === $sentinel && is_primitive(value))) {
        return value;
    }
    
    return clone(node);
}