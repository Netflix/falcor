var pathsets = require("pathsets");
var options  = require("support/json-options")(require("support/options"));
var sequence = require("walk/sequence");
var setNode  = require("set/node");
var getJSON  = require("json-graph/link");
var setJSONLink = sequence(setNode, getJSON);
var setLink  = require("get/soft-link")(setJSONLink);
var addReq   = require("get/add-requested-key");
var setEdge  = require("set/edge");
var onError  = require("support/on-error");
var onEmpty  = require("pathsets/on-empty");

var onNode   = sequence(setLink, setNode, addReq, getJSON);
var onEdge   = sequence(setEdge, getJSON, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);