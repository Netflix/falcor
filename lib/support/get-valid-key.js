module.exports = function(key, path) {
    if(key != null) {
        return key;
    }
    var index = path.length;
    while(--index > -1) {
        if((key = path[index]) != null) {
            return key;
        }
    }
    return null;
}