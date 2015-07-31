var $atom = require("./../types/atom");
var cloneMisses = require("./../support/clone-missing-path-maps");
var isExpired = require("./../support/is-expired");

module.exports = function treatNodeAsMissingPathMap(roots, node, type, pathmap, keysStack, depth, requested, optimized) {
    var dematerialized = !roots.materialized;
    if (node == null && dematerialized) {
        cloneMisses(roots, pathmap, keysStack, depth, requested, optimized);
        return true;
    } else if (Boolean(type)) {
        if (type === $atom && node.value === void 0 && dematerialized && !roots.boxed) {
            return true;
        } else if (isExpired(roots, node)) {
            cloneMisses(roots, pathmap, keysStack, depth, requested, optimized);
            return true;
        }
    }
    return false;
};
