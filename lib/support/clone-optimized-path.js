module.exports = function(optimized, rest) {
    var x;
    var i = -1;
    var j = -1;
    var n = optimized.length;
    var m = rest.length;
    var array2 = new Array(n + m);
    while(++i < n) { array2[i] = optimized[i]; }
    while(++j < m) { if((x = rest[j]) != null) { array2[i++] = x; } }
    return array2;
}