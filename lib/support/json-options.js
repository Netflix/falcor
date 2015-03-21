module.exports = function(options) {
    return function(model, values) {
        
        var opts = options(model, values);
        
        var offset  = opts.offset || 0;
        var jsons   = [];
        var keysets = [];
        
        jsons[offset - 2] = jsons;
        keysets[offset - 1] = offset - 1;
        
        opts.jsons = jsons;
        opts.keysets = keysets;
        
        opts.offset = offset;
        
        return opts;
    }
}