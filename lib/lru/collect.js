var __key = require("./../internal/key");
var __parent = require("./../internal/parent");

var __head = require("./../internal/head");
var __tail = require("./../internal/tail");
var __next = require("./../internal/next");
var __prev = require("./../internal/prev");

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
        } else if (parent = node[__parent]) {
            removeNode(node, parent, node[__key], lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        var prev = lru[__tail];
        node = prev;
        while ((total >= targetSize) && node) {
            prev = prev[__prev];
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        lru[__tail] = lru[__prev] = node;
        if (node == null) {
            lru[__head] = lru[__next] = void 0;
        } else {
            node[__next] = void 0;
        }
    }
};
