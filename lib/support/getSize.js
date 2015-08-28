var isObject = require("./../support/isObject");
module.exports = function getSize(node) {
    return isObject(node) && node.$size || 0;
};
