module.exports = function arrayAppend(array, value) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n + 1);
    while (++i < n) {
        array2[i] = array[i];
    }
    array2[i] = value;
    return array2;
};
