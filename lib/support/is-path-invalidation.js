var is_object = require("falcor/support/is-object");

module.exports = function is_path_invalidation(pathValue) {
    return is_object(pathValue) && (typeof pathValue.invalidated === "Boolean");
};