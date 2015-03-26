var array_clone = require("./array-clone");
module.exports = function(roots, requested, optimized) {
    roots.requestedPaths.push(array_clone(requested));
    roots.optimizedPaths.push(array_clone(optimized));
}