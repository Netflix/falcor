module.exports = function(array, index) {
    var i = -1;
    var n = Math.max(array.length - index, 0);
    var array2 = new Array(n);
    while(++i < n) { array2[i] = array[i + index]; }
    return array2;
};