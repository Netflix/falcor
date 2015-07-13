var $ref = require("./../types/ref");
var $expired = "expired";
var replace_node = require("./../support/replace-node");
var graph_node = require("./../support/graph-node");
var update_back_refs = require("./../support/update-back-refs");
var is_primitive = require("./../support/is-primitive");
var is_expired = require("./../support/is-expired");

// TODO: comment about what happens if node is a branch vs leaf.
module.exports = function create_branch(roots, parent, node, type, key) {

    if(Boolean(type) && is_expired(roots, node)) {
        type = $expired;
    }

    if((Boolean(type) && type != $ref) || is_primitive(node)) {
        node = replace_node(parent, node, {}, key, roots.lru);
        node = graph_node(roots[0], parent, node, key, undefined);
        node = update_back_refs(node, roots.version);
    }
    return node;
}