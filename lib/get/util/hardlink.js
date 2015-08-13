var __ref = require("./../../internal/ref");
var __context = require("./../../internal/context");
var __refIndex = require("./../../internal/ref-index");
var __refsLength = require("./../../internal/refs-length");

function createHardlink(from, to) {

    // create a back reference
    var backRefs = to[__refsLength] || 0;
    to[__ref + backRefs] = from;
    to[__refsLength] = backRefs + 1;

    // create a hard reference
    from[__refIndex] = backRefs;
    from[__context] = to;
}

function removeHardlink(cacheObject) {
    var context = cacheObject[__context];
    if (context) {
        var idx = cacheObject[__refIndex];
        var len = context[__refsLength];

        while (idx < len) {
            context[__ref + idx] = context[__ref + idx + 1];
            ++idx;
        }

        context[__refsLength] = len - 1;
        cacheObject[__context] = void 0;
        cacheObject[__refIndex] = void 0;
    }
}

module.exports = {
    create: createHardlink,
    remove: removeHardlink
};
