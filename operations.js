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

prototype._setPathSetsAsJSON = require("./lib/json-dense/set-path-values");
prototype._setPathSetsAsJSONG = require("./lib/json-graph/set-path-values");
prototype._setPathSetsAsPathMap = require("./lib/json-sparse/set-path-values");
prototype._setPathSetsAsValues = require("./lib/json-values/set-path-values");

prototype._setJSONGsAsJSON = require("./lib/json-dense/set-json-graph");
prototype._setJSONGsAsJSONG = require("./lib/json-graph/set-json-graph");
prototype._setJSONGsAsPathMap = require("./lib/json-sparse/set-json-graph");
prototype._setJSONGsAsValues = require("./lib/json-values/set-json-graph");

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = get.setCache;

module.exports = falcor;

