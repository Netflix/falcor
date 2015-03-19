module.exports = function(options) {
    return function(model, values) {
        var opts = options(model, values);
        opts.jsons = [];
        opts.keysets = [];
        opts.jsons[-1] = opts.jsonRoot = values && values[0];
        opts.offset = 0;
        return opts;
    }
}