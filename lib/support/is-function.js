var function_typeof = "function";

module.exports = function is_function(func) {
    return Boolean(func) && typeof func === function_typeof;
};