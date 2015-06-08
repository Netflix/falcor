var lru = require('falcor/get/util/lru');
var clone = require('falcor/get/util/clone');
var promote = lru.promote;
module.exports = function onError(model, node, permuteRequested, permuteOptimized, outerResults) {
    var value = node.value;

    if (model._boxed) {
        value = clone(node);
    }
    outerResults.errors.push({path: permuteRequested, value: value});
    promote(model, node);
};

