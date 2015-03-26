var transfer_back_refs = require("./transfer-back-refs");
var invalidate_node = require("./invalidate-node");

module.exports = function(parent, node, replacement, key, lru) {
    if(node != null && node !== replacement && typeof node == "object") {
        transfer_back_refs(node, replacement);
        invalidate_node(parent, node, key, lru);
    }
    return parent[key] = replacement;
}