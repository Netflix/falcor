var $error = require("./../types/error");
var promote = require("./../lru/promote");
var arrayClone = require("./../support/array-clone");
var clone = require("./../support/clone");

module.exports = function treatNodeAsError(roots, node, type, path) {
    if (node == null) {
        return false;
    }
    promote(roots.lru, node);
    if (type !== $error || roots.errorsAsValues) {
        return false;
    }
    roots.errors.push({
        path: arrayClone(path),
        value: roots.boxed && clone(node) || node.value
    });
    return true;
};
