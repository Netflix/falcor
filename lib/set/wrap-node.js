var clone = require("../support/clone");
module.exports = function(node, type, value) {
    
    var dest = node, size = 1;
    
    if(type == "reference") {
        dest = clone(node);
        size = 50 + (value.length || 1);
    } else if(type == "sentinel") {
        dest = clone(node);
        size = 50 + ((typeof value == "string") && value.length || 1);
    } else if(type == "error") {
        dest = clone(node);
        size = node.$size || 51;
    } else if(typeof node == "object") {
        dest = clone(node);
        type = node.$type || "group";
        size = node.$size || 51;
    } else {
        dest = Object.create(null);
        dest.value = clone(value);
        size = 50 + ((typeof value == "string") && value.length || 1);
        type = "sentinel";
    }
    
    dest.$type = type;
    dest.$size = size;
    
    return dest;
}