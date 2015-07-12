var obj_typeof = "object";
module.exports = function is_object(value) {
    return value != null && typeof value == obj_typeof;
};