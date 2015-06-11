module.exports = function array_clone(array) {
    if(!array) { return array; };
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while(++i < n) { array2[i] = array[i]; }
    return array2;
};