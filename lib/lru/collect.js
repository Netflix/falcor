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
        } else if (parent = node.$_parent) {  // eslint-disable-line no-cond-assign
            removeNode(node, parent, node.$_key, lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        var prev = lru.$_tail;
        node = prev;
        while ((total >= targetSize) && node) {
            prev = prev.$_prev;
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        lru.$_tail = lru.$_prev = node;
        if (node == null) {
            lru.$_head = lru.$_next = undefined;
        } else {
            node.$_next = undefined;
        }
    }
};
