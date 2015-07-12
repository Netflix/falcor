var is_object = require("./../support/is-object");
module.exports = function get_size(node) {
    return is_object(node) && node.$size || 0;
};