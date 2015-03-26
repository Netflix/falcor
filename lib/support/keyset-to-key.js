module.exports = key_to_keyset;

var isArray = Array.isArray;

function key_to_keyset(key, iskeyset) {
    if(iskeyset) {
        if(isArray(key)) {
            key = key[key.__offset || (key.__offset = 0)];
            return key_to_keyset(key, key != null && typeof key === "object");
        } else {
            if(key.__offset === undefined) {
                key.__offset = key.from || (key.from = 0);
            }
            return key.__offset;
        }
    }
    return key;
}

