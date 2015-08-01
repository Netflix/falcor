var isObject = require("./../support/is-object");
var prefix = require("./../internal/prefix");

module.exports = function clone(value) {
    var dest = value,
        src = dest,
        i = -1,
        n, keys, key;
    if (isObject(dest)) {
        dest = {};
        keys = Object.keys(src);
        n = keys.length;
        while (++i < n) {
            key = keys[i];
            if (key[0] !== prefix) {
                dest[key] = src[key];
            }
        }
    }
    return dest;
};
