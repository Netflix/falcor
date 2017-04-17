var splice = require("./../lru/splice");

module.exports = function expireNode(node, expired, lru) {
    if (!node.$_invalidated) {
        node.$_invalidated = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};
