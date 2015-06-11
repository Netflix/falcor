var __key = require("falcor/internal/key");
var __version = require("falcor/internal/version");
var __parent = require("falcor/internal/parent");
var remove_node = require("falcor/support/remove-node");
var update_back_refs = require("falcor/support/update-back-refs");

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
};