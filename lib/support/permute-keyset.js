module.exports = permute_keyset;

var prefix = require("../types/internal-prefix");
var __offset = prefix + "offset";
var is_array = Array.isArray;
var is_object = require("./is-object");

function permute_keyset(key) {
    if(is_array(key)) {
        
        if(key[__offset] === undefined) {
            key[__offset] = -1;
            if(key.length == 0) {
                throw new Error("Array keysets must contain at least one key.");
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
                if(!key.length) {
                    throw new Error("Range keysets must specify at least one index to retrieve.");
                }
                key.to = key.from + (key.length || 1) - 1;
            }
        }
        
        if(key.to < key.from) {
            key.from = key.to;
            key.to = key[__offset] + 1;
            key[__offset] = key.from - 1;
        }
        
        if(++key[__offset] > key.to) {
            key[__offset] = key.from - 1;
            return false;
        }
        
        return true;
    }
    
    return false;
}

