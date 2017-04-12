var __ref = require("./../internal/ref");

module.exports = function createHardlink(from, to) {

    // create a back reference
    var backRefs = to.$refsLength || 0;
    to[__ref + backRefs] = from;
    to.$refsLength = backRefs + 1;

    // create a hard reference
    from.$refIndex = backRefs;
    from.$context = to;
};
