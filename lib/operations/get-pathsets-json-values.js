var pathsets = require("../pathsets/json-values");
var options  = require("../support/options");
var sequence = require("../walk/sequence");
var getNode  = require("../get/node");
var getLink  = require("../get/hard-link")(getNode);
var addReq   = require("../get/add-requested-key");
var getEdge  = require("../json-values/edge");
var onError  = require("../support/on-error");
var onEmpty  = require("../pathsets/on-empty");
var checkExpired = require("../support/check-expired");

var onNode   = sequence(getLink, getNode, addReq);
var onEdge   = sequence(checkExpired, getEdge, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);