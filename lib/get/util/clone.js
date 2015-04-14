// Copies the node
var prefix = require("../../internal/prefix");
module.exports = function clone(node) {
    var outValue, i, len;
    var keys = Object.keys(node);
    
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        // if (k.indexOf('__') === 0 || k === '/' || k === './' || k === '../') {
        if (k[0] === prefix || k === '/' || k === './' || k === '../') {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};

