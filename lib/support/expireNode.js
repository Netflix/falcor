var splice = require("./../lru/splice");

module.exports = function expireNode(node, expired, lru) {
    if (!node.ツinvalidated) {
        node.ツinvalidated = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};
