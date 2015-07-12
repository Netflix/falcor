var obj_typeof = "object";
module.exports = function is_primitive(value) {
    return value == null || typeof value != obj_typeof;
};