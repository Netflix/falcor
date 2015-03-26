module.exports = function(array) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while(++i < n) { array2[i] = array[i]; }
    return array2;
};