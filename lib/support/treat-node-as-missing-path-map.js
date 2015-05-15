var $atom = require("../types/atom");
var clone_misses = require("./clone-missing-path-maps");
var is_expired = require("./is-expired");

module.exports = function(roots, node, type, pathmap, keys_stack, depth, requested, optimized) {
    var dematerialized = !roots.materialized;
    if(node == null && dematerialized) {
        clone_misses(roots, pathmap, keys_stack, depth, requested, optimized);
        return true;
    } else if(Boolean(type)) {
        if(type == $atom && node.value === undefined && dematerialized && !roots.boxed) {
            return true;
        } else if(is_expired(roots, node)) {
            clone_misses(roots, pathmap, keys_stack, depth, requested, optimized);
            return true;
        }
    }
    return false;
};