module.exports = function(options) {
    return function(model, values) {
        var opts = options(model, values);
        opts.messages = [];
        return opts;
    }
}