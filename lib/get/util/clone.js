// Copies the node
var unicodePrefix = require("./../../internal/unicodePrefix");

module.exports = function clone(node) {
    var outValue, i, len;
    var keys = Object.keys(node);
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        var k0 = k.charAt(0);
        if (k0 === unicodePrefix) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};

