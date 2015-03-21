var walk = require("../walk/pathset");

module.exports = function(options, onNode, onEdge) {
    
    return function(model, pathvalues, values) {
        
        var opts   = options(model, values);
        var jsons  = opts.jsons;
        var values = opts.values;
        var offset = opts.offset || 0;
        var index  = -1;
        var count  = pathvalues.length;
        var pv, hasValue = false;
        
        while(++index < count) {
            jsons[offset-1] = values && values[0];
            pv = pathvalues[index];
            opts.index = index;
            opts.message = pv.value;
            opts = walk(onNode, onEdge, opts, pv.path);
            hasValue || (hasValue = opts.hasValue);
        }
        
        if(values) {
            values[0] = hasValue ? { json: jsons[offset - 1] } : undefined;
        }
        
        return opts;
    };
};