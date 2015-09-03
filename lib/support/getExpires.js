var isObject = require("./isObject");
module.exports = function getSize(node) {
    return isObject(node) && node.$expires || undefined;
};
