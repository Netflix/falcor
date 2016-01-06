var __ref = require("./../../internal/ref");

function createHardlink(from, to) {

    // create a back reference
    var backRefs = to.__refsLength || 0;
    to[__ref + backRefs] = from;
    to.__refsLength = backRefs + 1;

    // create a hard reference
    from.__refIndex = backRefs;
    from.__context = to;
}

module.exports = {
    create: createHardlink
};
