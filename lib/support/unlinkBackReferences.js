var __ref = require("./../internal/ref");

module.exports = function unlinkBackReferences(node) {
    // eslint-disable-next-line camelcase
    var i = -1, n = node.$_refsLength || 0;
    while (++i < n) {
        var ref = node[__ref + i];
        if (ref != null) {
            // eslint-disable-next-line camelcase
            ref.$_context = ref.$_refIndex = node[__ref + i] = void 0;
        }
    }
    // eslint-disable-next-line camelcase
    node.$_refsLength = void 0;
    return node;
};
