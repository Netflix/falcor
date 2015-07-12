var __key = require("./../internal/key");
var __version = require("./../internal/version");
var __parent = require("./../internal/parent");
var remove_node = require("./../support/remove-node");
var update_back_refs = require("./../support/update-back-refs");

module.exports = function update_graph(node, offset, version, lru) {
    var child;
    while((child = node)) {
        node = child[__parent];
        if((child.$size = (child.$size || 0) - offset) <= 0 && node != null) {
            remove_node(node, child, child[__key], lru);
        } else if(child[__version] !== version) {
            update_back_refs(child, version);
        }
    }
}
