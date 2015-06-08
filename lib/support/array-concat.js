module.exports = function array_concat(array, other) {
    var i = -1, j = -1;
    var n = array.length;
    var m = other.length;
    var array2 = new Array(n + m);
    while(++i < n) { array2[i] = array[i]; }
    while(++j < n) { array2[i++] = other[j]; }
    return array2;
};