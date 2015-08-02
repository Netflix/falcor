var objTypeof = "object";
module.exports = function isObject(value) {
    return value !== null && typeof value === objTypeof;
};
