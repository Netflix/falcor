var __ref = require("./../internal/ref");

module.exports = function unlinkForwardReference(reference) {
    var destination = reference.ツcontext;
    if (destination) {
        var i = (reference.ツrefIndex || 0) - 1,
            n = (destination.ツrefsLength || 0) - 1;
        while (++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        destination.ツrefsLength = n;
        reference.ツrefIndex = reference.ツcontext = destination = void 0;
    }
    return reference;
};
