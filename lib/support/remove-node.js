var $path = require("../types/path");
var $root = "/";
var $self = "./";
var $parent = "../"
var unlink = require("./unlink");
var delete_back_refs = require("./delete-back-refs");
var splice = require("../lru/splice");
var is_object = require("./is-object");

module.exports = function(parent, node, key, lru) {
    if(is_object(node)) {
        var type  = node.$type;
        if(!!type) {
            if(type == $path) { unlink(node); }
            splice(lru, node);
        }
        delete_back_refs(node);
        parent[key] = node[$root] = node[$parent] = node[$self] = undefined;
        return true;
    }
    return false;
}
