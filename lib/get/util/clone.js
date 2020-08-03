// Copies the node
var privatePrefix = require("./../../internal/privatePrefix");

module.exports = function clone(node) {
    if (node === undefined) {
        return node;
    }

    var outValue = {};
    for (var k in node) {
        if (k.lastIndexOf(privatePrefix, 0) === 0) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};
