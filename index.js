var falcor = require('./src');
var sentinelGet = require('./operations/alt-sentinel');
var prototype = falcor.Model.prototype;

prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = sentinelGet.getValueSync;
prototype._getPathSetsAsValues = sentinelGet.getAsValues;
prototype._getPathSetsAsJSON = sentinelGet.getAsJSON;
prototype._getPathSetsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathSetsAsJSONG = sentinelGet.getAsJSONG;
prototype._getPathMapsAsValues = sentinelGet.getAsValues;
prototype._getPathMapsAsJSON = sentinelGet.getAsJSON;
prototype._getPathMapsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathMapsAsJSONG = sentinelGet.getAsJSONG;

prototype._setPathSetsAsJSON = require("./lib/operations/set-pathsets-json-dense");
prototype._setPathSetsAsJSONG = require("./lib/operations/set-pathsets-json-graph");
prototype._setPathSetsAsPathMap = require("./lib/operations/set-pathsets-json-sparse");
prototype._setPathSetsAsValues = require("./lib/operations/set-pathsets-json-values");

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = require("./operations/alt-sentinel/legacy_setCache");

module.exports = falcor;

