var transferBackRefs = require('./transfer-back-refs');
var invalidateNode = require('./invalidate-node');

module.exports = function(lru, parent, node, replacement, key) {
    if(node !== replacement && node != null && typeof node == "object") {
        transferBackRefs(node, replacement);
        invalidateNode(lru, parent, node, key);
    }
    return parent[key] = replacement;
}