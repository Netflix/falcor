var pathsets = require("../pathsets/json-graph");
var options  = require("../support/json-options")(require("../support/options"));
var sequence = require("../walk/sequence");
var getNode  = require("../get/node");

var getJSONNode = require("../json-graph/node");
var getJSONEdge = require("../json-graph/edge");
var getJSONLink = sequence(getNode, require("../json-graph/link"));

var getLink  = require("../get/soft-link")(getJSONLink);
var addReq   = require("../get/add-requested-key");
var onError  = require("../support/on-error");
var onEmpty  = require("../pathsets/on-empty");
var checkExpired = require("../support/check-expired");

var onNode   = sequence(getLink, getNode, addReq, getJSONNode);
var onEdge   = sequence(checkExpired, getJSONEdge, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);