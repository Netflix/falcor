var __ref = require("./../internal/ref");

module.exports = function unlinkBackReferences(node) {
    var i = -1, n = node.$refsLength || 0;
    while (++i < n) {
        var ref = node[__ref + i];
        if (ref != null) {
            ref.$context = ref.$refIndex = node[__ref + i] = void 0;
        }
    }
    node.$refsLength = void 0;
    return node;
};
