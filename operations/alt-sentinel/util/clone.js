// Copies the node
module.exports = function clone(model, node) {
    var outValue, i, len;

    // There is no node and we are in materialized mode
    if (node === undefined && model._materialized) {
        outValue = {$type: 'sentinel'};
    }
    
    // there is a node and there is an object
    else {
        var keys = Object.keys(node);
        outValue = {};
        for (i = 0, len = keys.length; i < len; i++) {
            var k = keys[i];
            if (k.indexOf('__') === 0 || k === '/' || k === './' || k === '../') {
                continue;
            }
            outValue[k] = node[k];
        }
    }
    return outValue;
};

