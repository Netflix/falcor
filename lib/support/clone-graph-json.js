var $atom = require("./../types/atom");
var clone = require("./../support/clone");
var isPrimitive = require("./../support/is-primitive");
module.exports = function cloneJsonGraph(roots, node, type, value) {

    if (node == null || value === void 0) {
        return {
            $type: $atom
        };
    }

    if (roots.boxed === true) {
        return Boolean(type) && clone(node) || node;
    }

    if (!type || (type === $atom && isPrimitive(value))) {
        return value;
    }

    return clone(node);
};
