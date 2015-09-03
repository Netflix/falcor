var __ref = require("./../internal/ref");
var __context = require("./../internal/context");
var __refIndex = require("./../internal/ref-index");
var __refsLength = require("./../internal/refs-length");

module.exports = function unlinkForwardReference(reference) {
    var destination = reference[__context];
    if (destination) {
        var i = (reference[__refIndex] || 0) - 1,
            n = (destination[__refsLength] || 0) - 1;
        while (++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        destination[__refsLength] = n;
        reference[__refIndex] = reference[__context] = destination = void 0;
    }
    return reference;
};
