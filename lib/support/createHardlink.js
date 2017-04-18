var __ref = require("./../internal/ref");

module.exports = function createHardlink(from, to) {

    // create a back reference
    // eslint-disable-next-line camelcase
    var backRefs = to.$_refsLength || 0;
    to[__ref + backRefs] = from;
    // eslint-disable-next-line camelcase
    to.$_refsLength = backRefs + 1;

    // create a hard reference
    // eslint-disable-next-line camelcase
    from.$_refIndex = backRefs;
    // eslint-disable-next-line camelcase
    from.$_context = to;
};
