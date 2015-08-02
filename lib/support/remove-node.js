var $ref = require("./../types/ref");
var __parent = require("./../internal/parent");
var unlink = require("./../support/unlink");
var deleteBackRefs = require("./../support/delete-back-refs");
var splice = require("./../lru/splice");
var isObject = require("./../support/is-object");

module.exports = function removeNode(parent, node, key, lru) {
    if (isObject(node)) {
        var type = node.$type;
        if (Boolean(type)) {
            if (type === $ref) {
                unlink(node);
            }
            splice(lru, node);
        }
        deleteBackRefs(node);
        parent[key] = node[__parent] = void 0;
        return true;
    }
    return false;
};
