var falcor = require('./lib/falcor');
var sentinelGet = require('./lib/get');
var prototype = falcor.Model.prototype;

prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = sentinelGet.getValueSync;

prototype._getPathSetsAsJSON = require("./lib/json-dense/get-path-sets");
prototype._getPathSetsAsJSONG = require("./lib/json-graph/get-path-sets");
prototype._getPathSetsAsPathMap = require("./lib/json-sparse/get-path-sets");
prototype._getPathSetsAsValues = require("./lib/json-values/get-path-sets");

prototype._getPathMapsAsValues = sentinelGet.getAsValues;
prototype._getPathMapsAsJSON = sentinelGet.getAsJSON;
prototype._getPathMapsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathMapsAsJSONG = sentinelGet.getAsJSONG;

prototype._setPathSetsAsJSON = require("./lib/set/set-path-values-as-dense-json");
prototype._setPathSetsAsJSONG = require("./lib/set/set-path-values-as-json-graph");
prototype._setPathSetsAsPathMap = require("./lib/set/set-path-values-as-sparse-json");
prototype._setPathSetsAsValues = require("./lib/set/set-path-values-as-path-values");

prototype._setJSONGsAsJSON = require("./lib/set/set-json-graph-as-dense-json");
prototype._setJSONGsAsJSONG = require("./lib/set/set-json-graph-as-json-graph");
prototype._setJSONGsAsPathMap = require("./lib/set/set-json-graph-as-sparse-json");
prototype._setJSONGsAsValues = require("./lib/set/set-json-graph-as-path-values");

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = sentinelGet.setCache;

module.exports = falcor;

