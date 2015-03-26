var $ref = "__ref";
module.exports = function(node) {
    var ref, i = -1, n = node.__refs_length || 0;
    while(++i < n) {
        if((ref = node[$ref + i]) !== undefined) {
            ref.__context = ref.__ref_index = node[$ref + i] = undefined;
        }
    }
    node.__refs_length = undefined
}