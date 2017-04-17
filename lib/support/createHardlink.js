var __ref = require("./../internal/ref");

module.exports = function createHardlink(from, to) {

    // create a back reference
    var backRefs = to.$_refsLength || 0;
    to[__ref + backRefs] = from;
    to.$_refsLength = backRefs + 1;

    // create a hard reference
    from.$_refIndex = backRefs;
    from.$_context = to;
};
