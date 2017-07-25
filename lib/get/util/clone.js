// Copies the node
var privatePrefix = require("./../../internal/privatePrefix");

module.exports = function clone(node) {
    if (node === undefined) {
        return node;
    }

    var outValue, i, len;
    var keys = Object.keys(node);
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        var k0 = k.substr(0, 2);
        if (k0 === privatePrefix) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};
