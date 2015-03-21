module.exports = permuteKey;

var isArray = Array.isArray;

function permuteKey(key) {
    if(isArray(key)) {
        if(++key.__offset === key.length) {
            return permuteKey(key[key.__offset = 0]);
        } else {
            return false;
        }
    } else if(key != null && typeof key === "object") {
        if(++key.__offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
            key.__offset = key.from;
            return true;
        }
        return false;
    }
    return true;
}