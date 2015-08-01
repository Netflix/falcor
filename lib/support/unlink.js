var __ref = require("./../internal/ref");
var __context = require("./../internal/context");
var __refIndex = require("./../internal/ref-index");
var __refsLength = require("./../internal/refs-length");

module.exports = function unlinkRef(ref) {
    var destination = ref[__context];
    if (destination) {
        var i = (ref[__refIndex] || 0) - 1,
            n = (destination[__refsLength] || 0) - 1;
        while (++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        destination[__refsLength] = n;
        ref[__refIndex] = ref[__context] = destination = void 0;
    }
};
