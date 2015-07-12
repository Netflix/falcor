module.exports = function array_map(array, selector) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while(++i < n) { array2[i] = selector(array[i], i, array); }
    return array2;
}