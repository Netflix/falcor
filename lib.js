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

prototype._setPathSetsAsJSON = require("./lib/json-dense/set-path-values");
prototype._setPathSetsAsJSONG = require("./lib/json-graph/set-path-values");
prototype._setPathSetsAsPathMap = require("./lib/json-sparse/set-path-values");
prototype._setPathSetsAsValues = require("./lib/json-values/set-path-values");

prototype._setJSONGsAsJSON = require("./lib/json-dense/set-json-graph");
prototype._setJSONGsAsJSONG = require("./lib/json-graph/set-json-graph");
prototype._setJSONGsAsPathMap = require("./lib/json-sparse/set-json-graph");
prototype._setJSONGsAsValues = require("./lib/json-values/set-json-graph");

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = sentinelGet.setCache;

module.exports = falcor;

