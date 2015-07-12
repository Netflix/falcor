var __ref = require("./../internal/ref");
var __context = require("./../internal/context");
var __ref_index = require("./../internal/ref-index");
var __refs_length = require("./../internal/refs-length");

module.exports = function delete_back_refs(node) {
    var ref, i = -1, n = node[__refs_length] || 0;
    while(++i < n) {
        if((ref = node[__ref + i]) !== undefined) {
            ref[__context] = ref[__ref_index] = node[__ref + i] = undefined;
        }
    }
    node[__refs_length] = undefined
};