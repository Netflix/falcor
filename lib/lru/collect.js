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
            // eslint-disable-next-line camelcase
        } else if (parent = node.$_parent) { // eslint-disable-line no-cond-assign
            // eslint-disable-next-line camelcase
            removeNode(node, parent, node.$_key, lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        // eslint-disable-next-line camelcase
        var prev = lru.$_tail;
        node = prev;
        while ((total >= targetSize) && node) {
            // eslint-disable-next-line camelcase
            prev = prev.$_prev;
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        // eslint-disable-next-line camelcase
        lru.$_tail = lru.$_prev = node;
        if (node == null) {
            // eslint-disable-next-line camelcase
            lru.$_head = lru.$_next = undefined;
        } else {
            // eslint-disable-next-line camelcase
            node.$_next = undefined;
        }
    }
};
