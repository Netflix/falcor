// Copies the node
var prefix = require("./../../internal/prefix");
var unicodePrefix = require("./../../internal/unicodePrefix");
var $modelCreated = require("./../../internal/model-created");

module.exports = function clone(node) {
    var outValue, i, len;
    var keys = Object.keys(node);
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        var k0 = k.charAt(0);
        if (k0 === prefix || k0 === unicodePrefix || k === $modelCreated) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};

