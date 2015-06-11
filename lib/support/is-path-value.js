var is_array = Array.isArray;
var is_object = require("falcor/support/is-object");

module.exports = function is_path_value(pathValue) {
    return is_object(pathValue) &&  (
        is_array(pathValue.path) || (
            typeof pathValue.path === "string"
        ));
};