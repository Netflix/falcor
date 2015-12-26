var __ref = require("./../../internal").ref;
var __context = require("./../../internal").context;
var __refIndex = require("./../../internal").refIndex;
var __refsLength = require("./../../internal").refsLength;

function createHardlink(from, to) {

    // create a back reference
    var backRefs = to[__refsLength] || 0;
    to[__ref + backRefs] = from;
    to[__refsLength] = backRefs + 1;

    // create a hard reference
    from[__refIndex] = backRefs;
    from[__context] = to;
}

module.exports = {
    create: createHardlink
};
