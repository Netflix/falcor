var $path = require("../types/$path");
var replace_node = require("./replace-node");
var graph_node = require("./graph-node");
var update_back_refs = require("./update-back-refs");
var is_primitive = require("./is-primitive");

module.exports = function(roots, parent, node, type, key) {
    if((!!type && type != $path) || is_primitive(node)) {
        node = replace_node(parent, node, {}, key, roots.lru);
        node = graph_node(roots[0], parent, node, key, 0);
        node = update_back_refs(node, roots.version);
    }
    return node;
}