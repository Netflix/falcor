var array_slice = require("./array-slice");
var array_clone = require("./array-clone");
module.exports = function(roots, requested, optimized) {
    roots.requestedPaths.push(array_slice(requested, roots.offset));
    roots.optimizedPaths.push(array_clone(optimized));
}