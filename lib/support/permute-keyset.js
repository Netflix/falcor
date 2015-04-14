module.exports = permute_keyset;

var __offset = require("../internal/offset");
var is_array = Array.isArray;
var is_object = require("./is-object");

function permute_keyset(key) {
    if(is_array(key)) {
        
        if(key[__offset] === undefined) {
            key[__offset] = -1;
            if(key.length == 0) {
                return false;
            }
        }
        if(++key[__offset] >= key.length) {
            return permute_keyset(key[key[__offset] = -1]);
        } else {
            return true;
        }
    } else if(is_object(key)) {
        if(key[__offset] === undefined) {
            key[__offset] = (key.from || (key.from = 0)) - 1;
            if(key.to === undefined) {
                if(key.length === undefined) {
                    throw new Error("Range keysets must specify at least one index to retrieve.");
                } else if(key.length === 0) {
                    return false;
                }
                key.to = key.from + (key.length || 1) - 1;
            }
        }
        
        if(++key[__offset] > key.to) {
            key[__offset] = key.from - 1;
            return false;
        }
        
        return true;
    }
    
    return false;
}

