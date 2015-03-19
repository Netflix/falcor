module.exports = fromKeySet;

var __OFFSET = "__offset";
var isArray = Array.isArray;

function fromKeySet(key, isKeySet) {
    if(isKeySet) {
        if(isArray(key)) {
            key = key[key[__OFFSET] || (key[__OFFSET] = 0)];
            return fromKeySet(key, key != null && typeof key === "object");
        } else {
            if(key[__OFFSET] === undefined) {
                key[__OFFSET] = key.from || (key.from = 0);
            }
            return key[__OFFSET];
        }
    }
    return key;
}

