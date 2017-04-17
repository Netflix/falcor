var __ref = require("./../internal/ref");

module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode.$_refsLength || 0,
        destNodeRefsLength = destNode.$_refsLength || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[__ref + i];
        if (ref !== void 0) {
            ref.$_context = destNode;
            destNode[__ref + (destNodeRefsLength + i)] = ref;
            fromNode[__ref + i] = void 0;
        }
    }
    destNode.$_refsLength = fromNodeRefsLength + destNodeRefsLength;
    fromNode.$_refsLength = void 0;
    return destNode;
};
