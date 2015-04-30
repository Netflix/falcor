var $atom = require("../types/atom");
var clone = require("./clone");
module.exports = function(roots, node, type, value) {

    if(node == null || value === undefined) {
        return { $type: $atom };
    }

    if(roots.boxed == true) {
        return !!type && clone(node) || node;
    }

    return value;
}
