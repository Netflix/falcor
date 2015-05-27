var $error = require("../types/error");
var promote = require("../lru/promote");
var array_clone = require("./array-clone");
var clone = require("./clone");
module.exports = function treatNodeAsError(roots, node, type, path) {
    if(node == null) {
        return false;
    }
    promote(roots.lru, node);
    if(type != $error || roots.errorsAsValues) {
        return false;
    }
    roots.errors.push({
        path: array_clone(path),
        value: roots.boxed && clone(node) || node.value
    });
    return true;
};
