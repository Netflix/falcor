var splice = require("./../lru/splice");

module.exports = function expireNode(node, expired, lru) {
    if (!node.$invalidated) {
        node.$invalidated = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};
