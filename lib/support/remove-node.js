var $ref = require("./../types/ref");
var __parent = require("./../internal/parent");
var unlink = require("./../support/unlink");
var delete_back_refs = require("./../support/delete-back-refs");
var splice = require("./../lru/splice");
var is_object = require("./../support/is-object");

module.exports = function remove_node(parent, node, key, lru) {
    if(is_object(node)) {
        var type  = node.$type;
        if(Boolean(type)) {
            if(type == $ref) { unlink(node); }
            splice(lru, node);
        }
        delete_back_refs(node);
        parent[key] = node[__parent] = undefined;
        return true;
    }
    return false;
}
