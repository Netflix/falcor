var $sentinel = require("../types/sentinel");
var clone = require("./clone");
module.exports = function(roots, node, type, value) {

    if(node == null || value === undefined) {
        return { $type: $sentinel };
    }

    if(roots.boxed == true) {
        return !!type && clone(node) || node;
    }

    return value;
}
