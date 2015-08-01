var $atom = require("./../types/atom");

var now = require("./../support/now");
var clone = require("./../support/clone");
var isArray = Array.isArray;
var isObject = require("./../support/is-object");

// TODO: CR Wraps a node for insertion.
// TODO: CR Define default atom size values.
module.exports = function wrapNode(node, typeArg, value) {

    var type = typeArg;
    var dest = node,
        size = 0;

    if (Boolean(type)) {
        dest = clone(node);
        size = dest.$size;
        // }
        // if(type == $ref) {
        //     dest = clone(node);
        //     size = 50 + (value.length || 1);
        // } else if(isObject(node) && (type || (type = node.$type))) {
        //     dest = clone(node);
        //     size = dest.$size;
    } else {
        dest = {
            value: value
        };
        type = $atom;
    }

    if (size <= 0 || size == null) {
        switch (typeof value) {
            case "object":
                size = isArray(value) && (50 + value.length) || 51;
                break;
            case "string":
                size = 50 + value.length;
                break;
            default:
                size = 51;
                break;
        }
    }

    var expires = isObject(node) && node.$expires || void 0;
    if (typeof expires === "number" && expires < 0) {
        dest.$expires = now() + (expires * -1);
    }

    dest.$type = type;
    dest.$size = size;

    return dest;
};
