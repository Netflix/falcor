var __ref = require("./../internal/ref");
var __parent = require("./../internal/parent");
var __version = require("./../internal/version");
var __refsLength = require("./../internal/refs-length");

module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count--];
        if (node && node[__version] !== version) {
            node[__version] = version;
            stack[count++] = node[__parent];
            var i = -1;
            var n = node[__refsLength] || 0;
            while (++i < n) {
                stack[count++] = node[__ref + i];
            }
        }
    } while (count > -1);
    return nodeArg;
};
