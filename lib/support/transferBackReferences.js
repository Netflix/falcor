var __ref = require("./../internal/ref");

module.exports = function transferBackReferences(fromNode, destNode) {
    // eslint-disable-next-line camelcase
    var fromNodeRefsLength = fromNode.$_refsLength || 0,
        // eslint-disable-next-line camelcase
        destNodeRefsLength = destNode.$_refsLength || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[__ref + i];
        if (ref !== void 0) {
            // eslint-disable-next-line camelcase
            ref.$_context = destNode;
            destNode[__ref + (destNodeRefsLength + i)] = ref;
            fromNode[__ref + i] = void 0;
        }
    }
    // eslint-disable-next-line camelcase
    destNode.$_refsLength = fromNodeRefsLength + destNodeRefsLength;
    // eslint-disable-next-line camelcase
    fromNode.$_refsLength = void 0;
    return destNode;
};
