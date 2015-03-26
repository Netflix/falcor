module.exports = invalidate;

var is_object = require("./is-object");
var remove_node = require("./remove-node");

function invalidate(parent, node, key, lru) {
    if(remove_node(parent, node, key, lru)) {
        var type = node && node.$type || undefined;
        if(!type) {
            var keys = Object.keys(node);
            for(var i = -1, n = keys.length; ++i < n;) {
                var key = keys[i];
                invalidate(node, node[key], key);
            }
        }
        return true;
    }
    return false;
}