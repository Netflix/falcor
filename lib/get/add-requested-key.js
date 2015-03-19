module.exports = function(opts, set, depth, key, isKeySet) {
    var requestedPath = opts.requestedPath;
    requestedPath[depth] = key;
    return true;
}