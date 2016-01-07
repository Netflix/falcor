var isArray = Array.isArray;
var slice = Array.prototype.slice;
var prefix = require("../../../lib/internal/prefix");

module.exports = function strip(cache, allowedKeys) {
    if (cache == null || typeof cache !== "object") {
        return cache;
    } else if (isArray(cache)) {
        return slice.call(cache, 0);
    } else {
        allowedKeys = allowedKeys || [];
        return Object
            .keys(cache).sort()
            .reduce(function(obj, key) {
                var val = cache[key];
                if (val === void 0) {
                    return obj;
                } else if (
                    key.indexOf(prefix) !== 0 &&
                    key[0] !== "$"      ||
                    ~allowedKeys.indexOf(key)) {
                    obj[key] = strip(cache[key], allowedKeys);
                }
                return obj;
            }, {});
    }
};
