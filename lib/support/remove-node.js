var $path = require("../types/path");
var __parent = require("../internal/parent");
var unlink = require("./unlink");
var delete_back_refs = require("./delete-back-refs");
var splice = require("../lru/splice");
var is_object = require("./is-object");

module.exports = function(parent, node, key, lru) {
    if(is_object(node)) {
        var type  = node.$type;
        if(Boolean(type)) {
            if(type == $path) { unlink(node); }
            splice(lru, node);
        }
        delete_back_refs(node);
        parent[key] = node[__parent] = undefined;
        return true;
    }
    return false;
}
