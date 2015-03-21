var walk = require("../walk/pathset");

module.exports = function(options, onNode, onEdge) {
    
    return function(model, pathsets, values) {
        
        var opts   = options(model, values);
        var jsons  = opts.jsons;
        var values = opts.values;
        var offset = opts.offset || 0;
        var index  = -1;
        var count  = pathsets.length;
        var path, hasValue = false;
        
        while(++index < count) {
            jsons[offset-1] = values && values[0];
            path = pathsets[index];
            opts.index = index;
            opts = walk(onNode, onEdge, opts, path);
            hasValue || (hasValue = opts.hasValue);
        }
        
        if(values) {
            values[0] = hasValue ? { json: jsons[offset - 1] } : undefined;
        }
        
        return opts;
    };
};