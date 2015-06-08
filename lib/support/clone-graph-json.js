var $atom = require("falcor/types/atom");
var clone = require("falcor/support/clone");
var is_primitive = require("falcor/support/is-primitive");
module.exports = function clone_json_graph(roots, node, type, value) {

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
};