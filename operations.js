var falcor = require('./src');
var sentinelGet = require('./operations/alt-sentinel');
var prototype = falcor.Model.prototype;

prototype._getBoundContext = sentinelGet.getBoundContext;
prototype._getBoundValue = sentinelGet.getBoundValue;
prototype._getValueSync = sentinelGet.getValueSync;
prototype._getPathSetsAsValues = sentinelGet.getAsValues;
prototype._getPathSetsAsJSON = sentinelGet.getAsJSON;
prototype._getPathSetsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathSetsAsJSONG = sentinelGet.getAsJSONG;
prototype._getPathMapsAsValues = sentinelGet.getAsValues;
prototype._getPathMapsAsJSON = sentinelGet.getAsJSON;
prototype._getPathMapsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathMapsAsJSONG = sentinelGet.getAsJSONG;

prototype._setPathSetsAsJSON = require("./lib/json-dense/set-path-values");
prototype._setPathSetsAsJSONG = require("./lib/json-graph/set-path-values");
prototype._setPathSetsAsPathMap = require("./lib/json-sparse/set-path-values");
prototype._setPathSetsAsValues = require("./lib/json-values/set-path-values");

prototype._setJSONGsAsJSON = require("./lib/json-dense/set-json-graph");
prototype._setJSONGsAsJSONG = require("./lib/json-graph/set-json-graph");
prototype._setJSONGsAsPathMap = require("./lib/json-sparse/set-json-graph");
prototype._setJSONGsAsValues = require("./lib/json-values/set-json-graph");

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = require("./operations/alt-sentinel/legacy_setCache");

module.exports = falcor;

