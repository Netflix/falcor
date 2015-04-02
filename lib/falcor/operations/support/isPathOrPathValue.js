module.exports = function isPathOrPathValue(x) {
    return !!(Array.isArray(x)) || (
        x.hasOwnProperty("path") && x.hasOwnProperty("value"));
};
