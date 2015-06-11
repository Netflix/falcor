var is_object = require("falcor/support/is-object");
var remove_node = require("falcor/support/remove-node");
var prefix = require("falcor/internal/prefix");

module.exports = function invalidate_node(parent, node, key, lru) {
    if(remove_node(parent, node, key, lru)) {
        var type = is_object(node) && node.$type || undefined;
        if(type == null) {
            var keys = Object.keys(node);
            for(var i = -1, n = keys.length; ++i < n;) {
                var key = keys[i];
                if(key[0] !== prefix && key[0] !== "$") {
                    invalidate_node(node, node[key], key, lru);
                }
            }
        }
        return true;
    }
    return false;
};