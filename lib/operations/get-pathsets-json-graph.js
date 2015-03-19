var pathsets = require("pathsets");
var options  = require("support/json-options")(require("support/options"));
var sequence = require("walk/sequence");
var getNode  = require("get/node");
var getJSON  = require("json-graph/link");
var getJSONLink = sequence(getNode, getJSON);
var getLink  = require("get/soft-link")(getJSONLink);
var addReq   = require("get/add-requested-key");
var onError  = require("support/on-error");
var onEmpty  = require("pathsets/on-empty");

var onNode   = sequence(getLink, getNode, addReq, getJSON);
var onEdge   = sequence(getJSON, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);