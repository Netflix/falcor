var $path = require("../types/$path");
var $error = require("../types/$error");
var $sentinel = require("../types/$sentinel");

var now = require("./now");
var clone = require("./clone");
var is_object = require("./is-object");

module.exports = function(node, type, value) {
    
    var dest = node, size = 1;
    
    if(type == $path) {
        // dest = clone(node);
        size = 50 + (value.length || 1);
    } else if(type == $sentinel) {
        // dest = clone(node);
        size = 50 + ((typeof value == "string") && value.length || 1);
    } else if(type == $error) {
        // dest = clone(node);
        size = node.$size || 51;
    } else if(is_object(node) && !!(type || (type = node.$type))) {
        // dest = clone(node);
        size = node.$size || 51;
    } else {
        dest = { value: value };
        // dest.value = clone(value);
        size = 50 + ((typeof value == "string") && value.length || 1);
        type = $sentinel;
    }
    
    var expires = node.$expires;
    if(typeof expires === "number" && expires < 0) {
        node.$expires = now() + (expires * -1);
    }
    
    dest.$type = type;
    dest.$size = size;
    
    return dest;
}