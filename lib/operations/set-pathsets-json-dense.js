var pathsets = require("pathsets");
var options  = require("support/json-options")(require("support/options"));
var sequence = require("walk/sequence");
var setNode  = require("set/node");
var setLink  = require("get/hard-link")(setNode);
var addReq   = require("get/add-requested-key");
var setEdge  = require("set/edge");
var onError  = require("support/on-error");
var onEmpty  = require("pathsets/on-empty");

var getJSONNode  = require("json-dense/node");
var getJSONEdge  = require("json-sparse/edge");

var onNode   = sequence(setLink, setNode, addReq, getJSONNode);
var onEdge   = sequence(setEdge, getJSONEdge, onError, onEmpty);

module.exports = pathsets(options, onNode, onEdge);