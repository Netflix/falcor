var lru = require('falcor/get/util/lru');
var clone = require('falcor/get/util/clone');
var promote = lru.promote;
module.exports = function onError(model, node, permuteRequested, permuteOptimized, outerResults) {
    outerResults.errors.push({path: permuteRequested, value: node.value});
    promote(model, node);
};

