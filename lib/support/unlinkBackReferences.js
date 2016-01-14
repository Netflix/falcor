var __ref = require("./../internal/ref");

module.exports = function unlinkBackReferences(node) {
    var i = -1, n = node.ツrefsLength || 0;
    while (++i < n) {
        var ref = node[__ref + i];
        if (ref != null) {
            ref.ツcontext = ref.ツrefIndex = node[__ref + i] = void 0;
        }
    }
    node.ツrefsLength = void 0;
    return node;
};
