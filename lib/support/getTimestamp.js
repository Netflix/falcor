var isObject = require("./../support/isObject");
module.exports = function getTimestamp(node) {
    return isObject(node) && node.$timestamp || undefined;
};
