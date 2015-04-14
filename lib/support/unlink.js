var __ref = require("../internal/ref");
var __context = require("../internal/context");
var __ref_index = require("../internal/ref-index");
var __refs_length = require("../internal/refs-length");

module.exports = function(ref) {
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