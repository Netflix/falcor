var pathMap = require("./pathMap");
module.exports = function pathMapEnvelope(path, value) {
    return { json: pathMap(path, value) };
};
