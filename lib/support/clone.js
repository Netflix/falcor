var is_object = require("falcor/support/is-object");
var prefix = require("falcor/internal/prefix");

module.exports = function clone(value) {
    var dest = value, src = dest, i = -1, n, keys, key;
    if(is_object(dest)) {
        dest = {};
        keys = Object.keys(src);
        n = keys.length;
        while(++i < n) {
            key = keys[i];
            if(key[0] !== prefix) {
                dest[key] = src[key];
            }
        }
    }
    return dest;
};