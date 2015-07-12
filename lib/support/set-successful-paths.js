var array_slice = require("./../support/array-slice");
var array_clone = require("./../support/array-clone");

module.exports = function cloneSuccessPaths(roots, requested, optimized) {
    roots.requestedPaths.push(array_slice(requested, roots.offset));
    roots.optimizedPaths.push(array_clone(optimized));
}