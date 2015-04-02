var falcor = require('./lib/falcor');
var get = require('./lib/get');
var set = require('./lib/set');
var prototype = falcor.Model.prototype;

prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = get.getValueSync;

prototype._getPathSetsAsJSON = require("./lib/json-dense/get-path-sets");
prototype._getPathSetsAsJSONG = require("./lib/json-graph/get-path-sets");
prototype._getPathSetsAsPathMap = require("./lib/json-sparse/get-path-sets");
prototype._getPathSetsAsValues = require("./lib/json-values/get-path-sets");

prototype._getPathMapsAsValues = get.getAsValues;
prototype._getPathMapsAsJSON = get.getAsJSON;
prototype._getPathMapsAsPathMap = get.getAsPathMap;
prototype._getPathMapsAsJSONG = get.getAsJSONG;

prototype._setPathSetsAsJSON = set.setPathSetsAsJSON;
prototype._setPathSetsAsJSONG = set.setPathSetsAsJSONG;
prototype._setPathSetsAsPathMap = set.setPathSetsAsPathMap;
prototype._setPathSetsAsValues = set.setPathSetsAsValues;

prototype._setJSONGsAsJSON = set.setJSONGsAsJSON;
prototype._setJSONGsAsJSONG = set.setJSONGsAsJSONG;
prototype._setJSONGsAsPathMap = set.setJSONGsAsPathMap;
prototype._setJSONGsAsValues = set.setJSONGsAsValues;

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = get.setCache;

module.exports = falcor;

