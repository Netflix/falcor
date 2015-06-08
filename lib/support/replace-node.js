var transfer_back_refs = require("falcor/support/transfer-back-refs");
var invalidate_node = require("falcor/support/invalidate-node");

module.exports = function replace_node(parent, node, replacement, key, lru) {
    if(node != null && node !== replacement && typeof node == "object") {
        transfer_back_refs(node, replacement);
        invalidate_node(parent, node, key, lru);
    }
    return parent[key] = replacement;
}