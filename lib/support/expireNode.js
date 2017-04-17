var splice = require("./../lru/splice");

module.exports = function expireNode(node, expired, lru) {
    // eslint-disable-next-line camelcase
    if (!node.$_invalidated) {
        // eslint-disable-next-line camelcase
        node.$_invalidated = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};
