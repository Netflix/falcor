var __ref = require("./../internal/ref");

module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode.ツrefsLength || 0,
        destNodeRefsLength = destNode.ツrefsLength || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[__ref + i];
        if (ref !== void 0) {
            ref.ツcontext = destNode;
            destNode[__ref + (destNodeRefsLength + i)] = ref;
            fromNode[__ref + i] = void 0;
        }
    }
    destNode.ツrefsLength = fromNodeRefsLength + destNodeRefsLength;
    fromNode.ツrefsLength = void 0;
    return destNode;
};
