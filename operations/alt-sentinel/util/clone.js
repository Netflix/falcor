// Copies the node
module.exports = function clone(node) {
    var outValue, i, len;
    var keys = Object.keys(node);
    
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        if (k.indexOf('__') === 0 || k === '/' || k === './' || k === '../') {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};

