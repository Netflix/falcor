var __ref = require("./../internal/ref");

module.exports = function unlinkForwardReference(reference) {
    var destination = reference.$context;
    if (destination) {
        var i = (reference.$refIndex || 0) - 1,
            n = (destination.$refsLength || 0) - 1;
        while (++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        destination.$refsLength = n;
        reference.$refIndex = reference.$context = destination = void 0;
    }
    return reference;
};
