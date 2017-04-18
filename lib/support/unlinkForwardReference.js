var __ref = require("./../internal/ref");

module.exports = function unlinkForwardReference(reference) {
    // eslint-disable-next-line camelcase
    var destination = reference.$_context;
    if (destination) {
        // eslint-disable-next-line camelcase
        var i = (reference.$_refIndex || 0) - 1,
            // eslint-disable-next-line camelcase
            n = (destination.$_refsLength || 0) - 1;
        while (++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        // eslint-disable-next-line camelcase
        destination.$_refsLength = n;
        // eslint-disable-next-line camelcase
        reference.$_refIndex = reference.$_context = destination = void 0;
    }
    return reference;
};
