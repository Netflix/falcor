var $atom = require("./../types/atom");
var clone = require("./../support/clone");
module.exports = function clone_json_dense(roots, node, type, value) {

    if (node == null || value === undefined) {
        return { $type: $atom };
    }

    if (roots.boxed) {
        return Boolean(type) && clone(node) || node;
    }

    return value;
};
