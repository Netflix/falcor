var lru = require('./util/lru');
var clone = require('./util/clone');
var promote = lru.promote;
module.exports = function onError(model, node, permuteRequested, permuteOptimized, outerResults) {
    var value = node.value;

    if (model._boxed) {
        value = clone(node);
    }
    outerResults.errors.push({path: permuteRequested, value: value});
    promote(model, node);
};

