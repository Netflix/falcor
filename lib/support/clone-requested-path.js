module.exports = function(bound, requested, rest, index) {
    var x;
    var i = -1;
    var j = -1;
    var k = -1;
    var n = bound.length;
    var m = requested.length;
    var l = rest.length;
    var array2 = new Array(n + m + l);
    while(++i < n) { array2[i] = bound[i]; }
    while(++j < m) { if((x = requested[j]) != null) { array2[i++] = requested[j]; } }
    while(++k < l) { if((x = rest[k]) != null) { array2[i++] = rest[k]; } }
    if(index != null) {
        array2.pathSetIndex = index;
    }
    return array2;
}