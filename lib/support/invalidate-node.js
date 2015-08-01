var isObject = require("./../support/is-object");
var removeNode = require("./../support/remove-node");
var prefix = require("./../internal/prefix");

module.exports = function invalidateNode(parent, node, key, lru) {
    if (removeNode(parent, node, key, lru)) {
        var type = isObject(node) && node.$type || void 0;
        if (type == null) {
            var keys = Object.keys(node);
            for (var i = -1, n = keys.length; ++i < n;) {
                var key2 = keys[i];
                if (key2[0] !== prefix && key2[0] !== "$") {
                    invalidateNode(node, node[key2], key2, lru);
                }
            }
        }
        return true;
    }
    return false;
};
