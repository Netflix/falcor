var $sentinel = require("../types/sentinel");
var clone_misses = require("./clone-missing-path-sets");
var is_expired = require("./is-expired");

module.exports = function(roots, node, type, pathset, depth, requested, optimized) {
    var dematerialized = !roots.materialized;
    if(node == null && dematerialized) {
        clone_misses(roots, pathset, depth, requested, optimized);
        return true;
    } else if(!!type) {
        if(type == $sentinel && node.value === undefined && dematerialized && !roots.boxed) {
            return true;
        } else if(is_expired(roots, node)) {
            clone_misses(roots, pathset, depth, requested, optimized);
            return true;
        }
    }
    return false;
};
