var __ref = require("./../internal/ref");

module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        if (node && node.$version !== version) {
            node.$version = version;
            stack[count++] = node.$parent;
            var i = -1;
            var n = node.$refsLength || 0;
            while (++i < n) {
                stack[count++] = node[__ref + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};
