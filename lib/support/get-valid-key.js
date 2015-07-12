module.exports = function get_valid_key(path) {
    var key, index = path.length - 1;
    do {
        if((key = path[index]) != null) {
            return key;
        }
    } while(--index > -1);
    return null;
};