var prefix = require("../types/internal-prefix");
var __ref = prefix + "ref";
var __context = prefix + "context";
var __ref_index = prefix + "ref_index";
var __refs_length = prefix + "refs_length";

module.exports = function(node) {
    var ref, i = -1, n = node[__refs_length] || 0;
    while(++i < n) {
        if((ref = node[__ref + i]) !== undefined) {
            ref[__context] = ref[__ref_index] = node[__ref + i] = undefined;
        }
    }
    node[__refs_length] = undefined
}