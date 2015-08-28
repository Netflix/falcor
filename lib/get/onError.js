var lru = require("./../get/util/lru");
var clone = require("./../get/util/clone");
var promote = lru.promote;

module.exports = function onError(model, node, requestedPath, outerResults) {
    var value = node.value;
    if (!outerResults.errrors) {
        outerResults.errors = [];
    }

    if (model._boxed) {
        value = clone(node);
    }
    outerResults.errors.push({path: requestedPath, value: value});
    promote(model, node);
};
