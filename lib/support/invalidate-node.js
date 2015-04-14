module.exports = invalidate;

var is_object = require("./is-object");
var remove_node = require("./remove-node");
var prefix = require("../internal/prefix");

function invalidate(parent, node, key, lru) {
    if(remove_node(parent, node, key, lru)) {
        var type = is_object(node) && node.$type || undefined;
        if(type == null) {
            var keys = Object.keys(node);
            for(var i = -1, n = keys.length; ++i < n;) {
                var key = keys[i];
                if(key[0] !== prefix && key[0] !== "$") {
                    invalidate(node, node[key], key, lru);
                }
            }
        }
        return true;
    }
    return false;
}