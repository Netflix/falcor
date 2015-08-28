var isObject = require("./../support/isObject");

module.exports = function isPathInvalidation(pathValue) {
    return isObject(pathValue) && (typeof pathValue.invalidated === "boolean");
};
