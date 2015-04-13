var is_object = require("./is-object");
var prefix = require("../types/internal-prefix");

module.exports = function(value) {
    var dest = value, src = dest, i = -1, n, keys, key;
    if(is_object(dest)) {
        dest = {};
        keys = Object.keys(src);
        n = keys.length;
        while(++i < n) {
            key = keys[i];
            if(key[0] !== prefix && key !== "/" && key !== "./" && key !== "../") {
                dest[key] = src[key];
            }
        }
    }
    return dest;
}