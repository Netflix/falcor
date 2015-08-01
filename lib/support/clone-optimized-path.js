module.exports = function cloneOptimizedPath(optimized, pathset, depth) {
    var x;
    var i = -1;
    var j = depth - 1;
    var n = optimized.length;
    var m = pathset.length;
    var array2 = [];
    while (++i < n) {
        array2[i] = optimized[i];
    }
    while (++j < m) {
        x = pathset[j];
        if (x != null) {
            array2[i++] = x;
        }
    }
    return array2;
};
