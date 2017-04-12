var removeNode = require("./../support/removeNode");
var updateNodeAncestors = require("./../support/updateNodeAncestors");

module.exports = function collect(lru, expired, totalArg, max, ratioArg, version) {

    var total = totalArg;
    var ratio = ratioArg;

    if (typeof ratio !== "number") {
        ratio = 0.75;
    }

    var shouldUpdate = typeof version === "number";
    var targetSize = max * ratio;
    var parent, node, size;

    node = expired.pop();

    while (node) {
        size = node.$size || 0;
        total -= size;
        if (shouldUpdate === true) {
            updateNodeAncestors(node, size, lru, version);
        } else if (parent = node.$parent) {  // eslint-disable-line no-cond-assign
            removeNode(node, parent, node.$key, lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        var prev = lru.$tail;
        node = prev;
        while ((total >= targetSize) && node) {
            prev = prev.$prev;
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        lru.$tail = lru.$prev = node;
        if (node == null) {
            lru.$head = lru.$next = undefined;
        } else {
            node.$next = undefined;
        }
    }
};
