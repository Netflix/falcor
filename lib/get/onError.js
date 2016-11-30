var promote = require("./../lru/promote");
var clone = require("./../get/util/clone");

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
        path: requestedPath.slice(0, depth),
        value: value
    });
    promote(model._root, node);
};
