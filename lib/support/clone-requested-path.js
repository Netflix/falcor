var isObject = require("./../support/is-object");
module.exports = function cloneRequestedPath(bound, requested, pathset, depth, index) {
    var x;
    var i = -1;
    var j = -1;
    var l = 0;
    var m = requested.length;
    var n = bound.length;
    var array2 = [];
    while (++i < n) {
        array2[i] = bound[i];
    }
    while (++j < m) {
        x = requested[j];
        if (x != null) {
            if (isObject(pathset[l++])) {
                array2[i++] = [x];
            } else {
                array2[i++] = x;
            }
        }
    }
    m = n + l + pathset.length - depth;
    while (i < m) {
        array2[i++] = pathset[l++];
    }
    if (index != null) {
        array2.pathSetIndex = index;
    }
    return array2;
};
