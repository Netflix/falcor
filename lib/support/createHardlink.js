var __ref = require("./../internal/ref");

module.exports = function createHardlink(from, to) {

    // create a back reference
    var backRefs = to.ツrefsLength || 0;
    to[__ref + backRefs] = from;
    to.ツrefsLength = backRefs + 1;

    // create a hard reference
    from.ツrefIndex = backRefs;
    from.ツcontext = to;
};
