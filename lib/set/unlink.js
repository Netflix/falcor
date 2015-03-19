module.exports = function(ref) {
    var destination = ref[__CONTEXT];
    if(destination) {
        var i = (ref[__REF_INDEX] || 0) - 1,
            n = (destination[__REFS_LENGTH] || 0) - 1;
        while(++i <= n) {
            destination[__REF + i] = destination[__REF + (i + 1)];
        }
        destination[__REFS_LENGTH] = n;
        ref[__REF_INDEX] = ref[__CONTEXT] = destination = undefined;
    }
}