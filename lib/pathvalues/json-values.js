var walk = require("../walk/pathset");

module.exports = function(options, onNode, onEdge) {
    
    return function(model, pathvalues, values) {
        
        var opts  = options(model, values);
        var index = -1;
        var count = pathvalues.length;
        var pv;
        
        while(++index < count) {
            pv = pathvalues[index];
            opts.index = index;
            opts.message = pv.value;
            opts = walk(onNode, onEdge, opts, pv.path);
        }
        
        return opts;
    };
};