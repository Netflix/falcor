var isObject = require("./../support/is-object");
module.exports = function getSize(node) {
    return isObject(node) && node.$size || 0;
};
