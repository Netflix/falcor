var $atom = require("./../types/atom");
var clone = require("./../support/clone");
module.exports = function cloneJsonDense(roots, node, type, value) {

    if (node == null || value === void 0) {
        return {
            $type: $atom
        };
    }

    if (roots.boxed) {
        return Boolean(type) && clone(node) || node;
    }

    return value;
};
