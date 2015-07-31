var isObject = require("./../support/is-object");

module.exports = function isPathInvalidation(pathValue) {
    return isObject(pathValue) && (typeof pathValue.invalidated === "boolean");
};
