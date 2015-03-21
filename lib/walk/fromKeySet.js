module.exports = fromKeySet;

var isArray = Array.isArray;

function fromKeySet(key, isKeySet) {
    if(isKeySet) {
        if(isArray(key)) {
            key = key[key.__offset || (key.__offset = 0)];
            return fromKeySet(key, key != null && typeof key === "object");
        } else {
            if(key.__offset === undefined) {
                key.__offset = key.from || (key.from = 0);
            }
            return key.__offset;
        }
    }
    return key;
}

