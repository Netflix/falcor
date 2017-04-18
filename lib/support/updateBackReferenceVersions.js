var __ref = require("./../internal/ref");

module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        // eslint-disable-next-line camelcase
        if (node && node.$_version !== version) {
            // eslint-disable-next-line camelcase
            node.$_version = version;
            // eslint-disable-next-line camelcase
            stack[count++] = node.$_parent;
            var i = -1;
            // eslint-disable-next-line camelcase
            var n = node.$_refsLength || 0;
            while (++i < n) {
                stack[count++] = node[__ref + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};
