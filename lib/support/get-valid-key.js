module.exports = function getValidKey(path) {
    var key, index = path.length - 1;
    do {
        key = path[index];
        if (key != null) {
            return key;
        }
    } while (--index > -1);
    return null;
};
