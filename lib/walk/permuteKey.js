module.exports = permuteKey;

var __OFFSET = "__offset";
var isArray = Array.isArray;

function permuteKey(key) {
    if(isArray(key)) {
        if(++key[__OFFSET] === key.length) {
            return _permuteKeySet(key[key[__OFFSET] = 0]);
        } else {
            return false;
        }
    } else if(typeof key === "object") {
        if(++key[__OFFSET] > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
            key[__OFFSET] = key.from;
            return true;
        }
        return false;
    }
    return true;
}