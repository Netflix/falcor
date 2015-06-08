var __ref = require("falcor/internal/ref");
var __context = require("falcor/internal/context");
var __ref_index = require("falcor/internal/ref-index");
var __refs_length = require("falcor/internal/refs-length");

module.exports = function unlink_ref(ref) {
    var destination = ref[__context];
    if(destination) {
        var i = (ref[__ref_index] || 0) - 1,
            n = (destination[__refs_length] || 0) - 1;
        while(++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        destination[__refs_length] = n;
        ref[__ref_index] = ref[__context] = destination = undefined;
    }
}