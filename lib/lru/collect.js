var __head = require("../internal/head");
var __tail = require("../internal/tail");
var __next = require("../internal/next");
var __prev = require("../internal/prev");

var update_graph = require("../support/update-graph");
module.exports = function(lru, expired, version, total, max, ratio) {

    var targetSize = max * ratio;
    var node, size;

    while(Boolean(node = expired.pop())) {
        size = node.$size || 0;
        total -= size;
        update_graph(node, size, version, lru);
    }

    if(total >= max) {
        var prev = lru[__tail];
        while((total >= targetSize) && !!(node = prev)) {
            prev = prev[__prev];
            size = node.$size || 0;
            total -= size;
            update_graph(node, size, version, lru);
        }

        if((lru[__tail] = lru[__prev] = prev) == null) {
            lru[__head] = lru[__next] = undefined;
        } else {
            prev[__next] = undefined;
        }
    }
};