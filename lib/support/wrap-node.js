var $ref = require("./../types/ref");
var $error = require("./../types/error");
var $atom = require("./../types/atom");

var now = require("./../support/now");
var clone = require("./../support/clone");
var is_array = Array.isArray;
var is_object = require("./../support/is-object");

// TODO: CR Wraps a node for insertion.
// TODO: CR Define default atom size values.
module.exports = function wrap_node(node, type, value) {

    var dest = node, size = 0;

    if(Boolean(type)) {
        dest = clone(node);
        size = dest.$size;
    // }
    // if(type == $ref) {
    //     dest = clone(node);
    //     size = 50 + (value.length || 1);
    // } else if(is_object(node) && (type || (type = node.$type))) {
    //     dest = clone(node);
    //     size = dest.$size;
    } else {
        dest = { value: value };
        type = $atom;
    }

    if(size <= 0 || size == null) {
        switch(typeof value) {
            case "number":
            case "boolean":
            case "function":
            case "undefined":
                size = 51;
                break;
            case "object":
                size = is_array(value) && (50 + value.length) || 51;
                break;
            case "string":
                size = 50 + value.length;
                break;
        }
    }

    var expires = is_object(node) && node.$expires || undefined;
    if(typeof expires === "number" && expires < 0) {
        dest.$expires = now() + (expires * -1);
    }

    dest.$type = type;
    dest.$size = size;

    return dest;
}
