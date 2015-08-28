var lru = require("./../get/util/lru");
var clone = require("./../get/util/clone");
var promote = lru.promote;

module.exports = function onError(model, node, depth,
                                  requestedPath, outerResults) {
    var value = node.value;
    if (!outerResults.errors) {
        outerResults.errors = [];
    }

    if (model._boxed) {
        value = clone(node);
    }
    outerResults.errors.push({
        path: requestedPath.slice(0, depth + 1),
        value: value
    });
    promote(model, node);
};
