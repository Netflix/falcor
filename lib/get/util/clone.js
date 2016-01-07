// Copies the node
var prefix = require("./../../internal/prefix");
var $absolutePath = require("./../../internal/absolutePath");

module.exports = function clone(node) {
    var outValue, i, len;
    var keys = Object.keys(node);
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        if (k[0] === prefix || k === $absolutePath) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};

