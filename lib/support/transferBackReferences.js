var __ref = require("./../internal/ref");

module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode.$refsLength || 0,
        destNodeRefsLength = destNode.$refsLength || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[__ref + i];
        if (ref !== void 0) {
            ref.$context = destNode;
            destNode[__ref + (destNodeRefsLength + i)] = ref;
            fromNode[__ref + i] = void 0;
        }
    }
    destNode.$refsLength = fromNodeRefsLength + destNodeRefsLength;
    fromNode.$refsLength = void 0;
    return destNode;
};
