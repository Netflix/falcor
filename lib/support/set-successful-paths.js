var array_slice = require("falcor/support/array-slice");
var array_clone = require("falcor/support/array-clone");

module.exports = function cloneSuccessPaths(roots, requested, optimized) {
    roots.requestedPaths.push(array_slice(requested, roots.offset));
    roots.optimizedPaths.push(array_clone(optimized));
}