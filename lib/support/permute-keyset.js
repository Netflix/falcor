var __offset = require("./../internal/offset");
var isArray = Array.isArray;
var isObject = require("./../support/is-object");

module.exports = function permuteKeyset(key) {
    if (isArray(key)) {
        if (key.length === 0) {
            return false;
        }
        if (key[__offset] === void 0) {
            return permuteKeyset(key[key[__offset] = 0]) || true;
        } else if (permuteKeyset(key[key[__offset]])) {
            return true;
        } else if (++key[__offset] >= key.length) {
            key[__offset] = void 0;
            return false;
        } else {
            return true;
        }
    } else if (isObject(key)) {
        if (key[__offset] === void 0) {
            key[__offset] = (key.from || (key.from = 0)) - 1;
            if (key.to === void 0) {
                if (key.length === void 0) {
                    throw new Error("Range keysets must specify at least one index to retrieve.");
                } else if (key.length === 0) {
                    return false;
                }
                key.to = key.from + (key.length || 1) - 1;
            }
        }

        if (++key[__offset] > key.to) {
            key[__offset] = key.from - 1;
            return false;
        }

        return true;
    }

    return false;
};
