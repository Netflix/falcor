var is_object = require("./../support/is-object");

module.exports = function get_type(node, anyType) {
    var type = is_object(node) && node.$type || undefined;
    if(anyType && type) {
        return "branch";
    }
    return type;
};