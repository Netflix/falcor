// Copies the node
module.exports = function cloneAsValue(model, node) {
    var outValue, i, len;
    var type = node && node.$type;
    var value = type === 'sentinel' ? node.value : node;
    
    // There is no node and we are in materialized mode
    if (node === undefined && model._materialized) {
        outValue = {$type: 'sentinel'};
    }
    
    // there is a node and there is an object
    else if (typeof value === 'object') {
        
        if (Array.isArray(value)) {
            outValue = [];
            for (i = 0, len = value.length; i < len; i++) {
                outValue[i] = value[i];
            }
        } else {
            var keys = Object.keys(value);
            outValue = {};
            for (i = 0, len = keys.length; i < len; i++) {
                var k = keys[i];
                if (k.indexOf('__') === 0 || k === '/' || k === './' || k === '../') {
                    continue;
                }
                outValue[k] = value[k];
            }
        }
    } else {
        outValue = value;
    }
    return outValue;
};

