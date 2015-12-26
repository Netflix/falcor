// Copies the node
var prefix = require("./../../internal").prefix;
var includedInternalKeys = {};
var internalKeys = require("./../../internal");
includedInternalKeys[internalKeys.path] = true;
includedInternalKeys[internalKeys.refPath] = true;
includedInternalKeys[internalKeys.toReference] = true;

var excludedMetadataKeys = {};
excludedMetadataKeys[internalKeys.size] = true;

module.exports = function clone(node) {
    var outValue, i, len;
    var keys = Object.keys(node);
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        var ch = k.charAt(0);
        if (ch === prefix && !includedInternalKeys[k]) {
            continue;
        } else if (ch === "$" && excludedMetadataKeys[k]) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};

