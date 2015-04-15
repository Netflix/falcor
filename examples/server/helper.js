module.exports = {
    toArray: function(range) {
        if (typeof range === 'number') {
            return [range];
        }
        var from = range.from;
        var to = range.to;
        var out = [];
        for (var i = from; i <= to; i++) {
            out[out.length] = i;
        }

        return out;
    }
};
