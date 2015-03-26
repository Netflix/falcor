module.exports = permute_keyset;

var isArray = Array.isArray;

function permute_keyset(key) {
    if(isArray(key)) {
        if(++key.__offset === key.length) {
            return permute_keyset(key[key.__offset = 0]);
        } else {
            return true;
        }
    } else if(key != null && typeof key === "object") {
        if(++key.__offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
            key.__offset = key.from;
            return false;
        }
        return true;
    }
    return false;
}

