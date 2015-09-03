var splice = require("./../lru/splice");
var __invalidated = require("./../internal/invalidated");

module.exports = function expireNode(node, expired, lru) {
    if (!node[__invalidated]) {
        node[__invalidated] = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};
