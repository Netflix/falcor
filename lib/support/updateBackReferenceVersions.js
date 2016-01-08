var __ref = require("./../internal/ref");

module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        if (node && node.ツversion !== version) {
            node.ツversion = version;
            stack[count++] = node.ツparent;
            var i = -1;
            var n = node.ツrefsLength || 0;
            while (++i < n) {
                stack[count++] = node[__ref + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};
