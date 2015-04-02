var falcor = require('./lib/falcor');
var get = require('./lib/get');
var prototype = falcor.Model.prototype;

prototype._getBoundValue = get.getBoundValue;
prototype._getValueSync = get.getValueSync;
prototype._getPathSetsAsValues = get.getAsValues;
prototype._getPathSetsAsJSON = get.getAsJSON;
prototype._getPathSetsAsPathMap = get.getAsPathMap;
prototype._getPathSetsAsJSONG = get.getAsJSONG;
prototype._getPathMapsAsValues = get.getAsValues;
prototype._getPathMapsAsJSON = get.getAsJSON;
prototype._getPathMapsAsPathMap = get.getAsPathMap;
prototype._getPathMapsAsJSONG = get.getAsJSONG;

prototype._setPathSetsAsJSON = require("./lib/set/set-path-values-as-dense-json");
prototype._setPathSetsAsJSONG = require("./lib/set/set-path-values-as-json-graph");
prototype._setPathSetsAsPathMap = require("./lib/set/set-path-values-as-sparse-json");
prototype._setPathSetsAsValues = require("./lib/set/set-path-values-as-path-values");

prototype._setJSONGsAsJSON = require("./lib/set/set-json-graph-as-dense-json");
prototype._setJSONGsAsJSONG = require("./lib/set/set-json-graph-as-json-graph");
prototype._setJSONGsAsPathMap = require("./lib/set/set-json-graph-as-sparse-json");
prototype._setJSONGsAsValues = require("./lib/set/set-json-graph-as-path-values");

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = get.setCache;

module.exports = falcor;

