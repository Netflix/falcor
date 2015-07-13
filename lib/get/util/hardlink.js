var __ref = require("./../../internal/ref");
var __context = require("./../../internal/context");
var __ref_index = require("./../../internal/ref-index");
var __refs_length = require("./../../internal/refs-length");

/**
 *
 * @private
 */
function createHardlink(from, to) {

    // create a back reference
    var backRefs  = to[__refs_length] || 0;
    to[__ref + backRefs] = from;
    to[__refs_length] = backRefs + 1;

    // create a hard reference
    from[__ref_index] = backRefs;
    from[__context] = to;
}

/**
 *
 * @private
 */
function removeHardlink(cacheObject) {
    var context = cacheObject[__context];
    if (context) {
        var idx = cacheObject[__ref_index];
        var len = context[__refs_length];

        while (idx < len) {
            context[__ref + idx] = context[__ref + idx + 1];
            ++idx;
        }

        context[__refs_length] = len - 1;
        cacheObject[__context] = undefined;
        cacheObject[__ref_index] = undefined;
    }
}

module.exports = {
    create: createHardlink,
    remove: removeHardlink
};
