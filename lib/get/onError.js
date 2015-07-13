var lru = require('./../get/util/lru');
var clone = require('./../get/util/clone');
var promote = lru.promote;

/**
 *
 * @private
 */
module.exports = function onError(model, node, permuteRequested, permuteOptimized, outerResults) {
    var value = node.value;

    if (model._boxed) {
        value = clone(node);
    }
    outerResults.errors.push({path: permuteRequested, value: value});
    promote(model, node);
};

