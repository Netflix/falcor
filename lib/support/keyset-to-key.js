module.exports = key_to_keyset;

var is_array = Array.isArray;
var is_object = require("./is-object");

function key_to_keyset(key, iskeyset) {
    if(iskeyset) {
        if(is_array(key)) {
            key = key[key.__offset];
            return key_to_keyset(key, is_object(key));
        } else {
            return key.__offset;
        }
    }
    return key;
}

