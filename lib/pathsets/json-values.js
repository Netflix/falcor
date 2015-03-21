var walk = require("../walk/pathset");

module.exports = function(options, onNode, onEdge) {
    
    return function(model, pathsets, values) {
        
        var opts  = options(model, values);
        var index = -1;
        var count = pathsets.length;
        var path;
        
        while(++index < count) {
            path = pathsets[index];
            opts.index = index;
            opts = walk(onNode, onEdge, opts, path);
        }
        
        return opts;
    };
};