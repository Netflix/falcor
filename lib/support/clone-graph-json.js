var $atom = require("../types/atom");
var clone = require("./clone");
var is_primitive = require("./is-primitive");
module.exports = function(roots, node, type, value) {

    if(node == null || value === undefined) {
        return { $type: $atom };
    }

    if(roots.boxed == true) {
        return Boolean(type) && clone(node) || node;
    }

    if(!type || (type === $atom && is_primitive(value))) {
        return value;
    }

    return clone(node);
}
