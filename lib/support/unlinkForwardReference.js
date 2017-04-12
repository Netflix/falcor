var __ref = require("./../internal/ref");

module.exports = function unlinkForwardReference(reference) {
    var destination = reference.$_context;
    if (destination) {
        var i = (reference.$_refIndex || 0) - 1,
            n = (destination.$_refsLength || 0) - 1;
        while (++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        destination.$_refsLength = n;
        reference.$_refIndex = reference.$_context = destination = void 0;
    }
    return reference;
};
