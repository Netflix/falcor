var remove_node = require("./remove-node");
var update_back_refs = require("./update-back-refs");

module.exports = function(node, offset, version, lru) {
    var child;
    while(child = node) {
        node = child["../"];
        if((child.$size = (child.$size || 0) - offset) <= 0 && node != null) {
            remove_node(node, child, child.__key, lru);
        } else if(child.__version !== version) {
            update_back_refs(child, version);
        }
    }
}