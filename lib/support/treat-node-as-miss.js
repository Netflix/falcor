var $sentinel = "sentinel";
var clone_misses = require("../support/clone-missing-paths");
module.exports = function(roots, node, type, pathset, requested, optimized) {
    var dematerialized = !roots.materialized;
    if(node == null && dematerialized) {
        clone_misses(roots, pathset, requested, optimized);
        return true;
    } else if(type == $sentinel && node.value === undefined && dematerialized && !roots.boxed) {
        return true;
    }
    return false;
}