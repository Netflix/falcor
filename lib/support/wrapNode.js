var jsong = require("falcor-json-graph");
var $atom = jsong.atom;

var now = require("./../support/now");
var expiresNow = require("../values/expires-now");

var __modelCreated = require("./../internal/model-created");

var atomSize = 50;

var clone = require("./../support/clone");
var isArray = Array.isArray;
var getSize = require("./../support/getSize");
var getExpires = require("./../support/getExpires");

module.exports = function wrapNode(nodeArg, typeArg, value) {

    var size = 0;
    var node = nodeArg;
    var type = typeArg;

    if (type) {
        node = clone(node);
        size = getSize(node);
        node.$type = type;
    } else {
        node = $atom(value);
        type = node.$type;
        node[__modelCreated] = true;
    }

    if (value == null) {
        size = atomSize + 1;
    } else if (size == null || size <= 0) {
        switch (typeof value) {
            case "object":
                if (isArray(value)) {
                    size = atomSize + value.length;
                } else {
                    size = atomSize + 1;
                }
                break;
            case "string":
                size = atomSize + value.length;
                break;
            default:
                size = atomSize + 1;
                break;
        }
    }

    var expires = getExpires(node);

    if (typeof expires === "number" && expires < expiresNow) {
        node.$expires = now() + (expires * -1);
    }

    node.$size = size;

    return node;
};
