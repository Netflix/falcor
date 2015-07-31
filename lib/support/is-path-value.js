var isArray = Array.isArray;
var isObject = require("./../support/is-object");

module.exports = function isPathValue(pathValue) {
    return isObject(pathValue) && (
        isArray(pathValue.path) || (
            typeof pathValue.path === "string"
        ));
};
