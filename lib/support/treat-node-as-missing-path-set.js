var $atom = require("./../types/atom");
var cloneMisses = require("./../support/clone-missing-path-sets");
var isExpired = require("./../support/is-expired");

module.exports = function treatNodeAsMissingPathSet(roots, node, type, pathset, depth, requested, optimized) {
    var dematerialized = !roots.materialized;
    if (node == null && dematerialized) {
        cloneMisses(roots, pathset, depth, requested, optimized);
        return true;
    } else if (Boolean(type)) {
        if (type === $atom && node.value === void 0 && dematerialized && !roots.boxed) {
            // Don't clone the missing paths because we found a value, but don't want to report it.
            // TODO: CR Explain weirdness further.
            return true;
        } else if (isExpired(roots, node)) {
            cloneMisses(roots, pathset, depth, requested, optimized);
            return true;
        }
    }
    return false;
};
