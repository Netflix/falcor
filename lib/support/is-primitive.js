var obj_typeof = "object";
module.exports = function(value) {
    return value == null || typeof value != obj_typeof;
}