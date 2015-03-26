module.exports = function(array, index) {
    var i = -1;
    var n = array.length - index;
    var array2 = new Array(n);
    while(++i < n) { array2[i] = array[i + index]; }
    return array2;
};