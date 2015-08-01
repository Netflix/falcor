var __offset = require("./../internal/offset");
var isArray = Array.isArray;
var isObject = require("./../support/is-object");

module.exports = function keyToKeyset(keyArg, iskeyset) {
    var key = keyArg;
    if (iskeyset) {
        if (isArray(key)) {
            key = key[key[__offset]];
            return keyToKeyset(key, isObject(key));
        } else {
            return key[__offset];
        }
    }
    return key;
};
