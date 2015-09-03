var strip = require("./strip");
var getModel = require("./getModel");
var setPathValues = require("../../../lib/set/setPathValues");

module.exports = function jsonGraphEnvelope(pathValues) {

    var jsonGraph = {};

    setPathValues(getModel({ cache: jsonGraph }), pathValues);

    return strip(jsonGraph, ["$type", "$expires", "$timestamp"]);
}