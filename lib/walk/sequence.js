module.exports = function() {
    var argsIdx = -1;
    var argsLen = arguments.length;
    var functions = new Array(argsLen);
    while(++argsIdx < argsLen) {
        functions[argsIdx] = arguments[argsIdx];
    }
    return function(options, set, depth, key, isKeySet) {
        var index = -1, fn;
        while(++index < argsLen) {
            if((fn = functions[index]) && fn(options, set, depth, key, isKeySet) === false) {
                return false;
            }
        }
        return true;
    }
}