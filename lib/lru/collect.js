var __key  = require("./../internal/key");
var __parent = require("./../internal/parent");

var __head = require("./../internal/head");
var __tail = require("./../internal/tail");
var __next = require("./../internal/next");
var __prev = require("./../internal/prev");

var remove_node = require("./../support/remove-node");
var update_graph = require("./../support/update-graph");

module.exports = function collect(lru, expired, total, max, ratio, version) {
    
    if(typeof ratio !== "number") {
        ratio = 0.75;
    }

    var shouldUpdate = typeof version === "number";
    var targetSize = max * ratio;
    var parent, node, size;

    while(!!(node = expired.pop())) {
        size = node.$size || 0;
        total -= size;
        if(shouldUpdate === true) {
            update_graph(node, size, version, lru);
        } else if(parent = node[__parent]) {
            remove_node(parent, node, node[__key], lru);
        }
    }

    if(total >= max) {
        var prev = lru[__tail];
        while((total >= targetSize) && !!(node = prev)) {
            prev = prev[__prev];
            size = node.$size || 0;
            total -= size;
            if(shouldUpdate === true) {
                update_graph(node, size, version, lru);
            }
        }
        
        if((lru[__tail] = lru[__prev] = prev) == null) {
            lru[__head] = lru[__next] = undefined;
        } else {
            prev[__next] = undefined;
        }
    }
};