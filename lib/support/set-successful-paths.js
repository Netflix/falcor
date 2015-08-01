var arraySlice = require("./../support/array-slice");
var arrayClone = require("./../support/array-clone");

module.exports = function cloneSuccessPaths(roots, requested, optimized) {
    roots.requestedPaths.push(arraySlice(requested, roots.offset));
    roots.optimizedPaths.push(arrayClone(optimized));
};
