var prefix = require("./../internal/prefix");
var unicodePrefix = require("./../internal/unicodePrefix");
var hasOwn = require("./../support/hasOwn");
var isArray = Array.isArray;
var isObject = require("./../support/isObject");
var $modelCreated = require("./../internal/model-created");

module.exports = function clone(value) {
    var dest = value;
    if (isObject(dest)) {
        dest = isArray(value) ? [] : {};
        var src = value;
        for (var key in src) {
            if (key[0] === prefix || key[0] === unicodePrefix ||
                key === $modelCreated || !hasOwn(src, key)) {
                continue;
            }
            dest[key] = src[key];
        }
    }
    return dest;
};
