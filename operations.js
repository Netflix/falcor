var falcor = require('./lib/falcor');
var get = require('./lib/get');
var set = require('./lib/set');
var inv = require('./lib/invalidate');
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

prototype._setPathSetsAsJSON = set.setPathSetsAsJSON;
prototype._setPathSetsAsJSONG = set.setPathSetsAsJSONG;
prototype._setPathSetsAsPathMap = set.setPathSetsAsPathMap;
prototype._setPathSetsAsValues = set.setPathSetsAsValues;

prototype._setJSONGsAsJSON = set.setJSONGsAsJSON;
prototype._setJSONGsAsJSONG = set.setJSONGsAsJSONG;
prototype._setJSONGsAsPathMap = set.setJSONGsAsPathMap;
prototype._setJSONGsAsValues = set.setJSONGsAsValues;

prototype._invPathSetsAsJSON = inv.invPathSetsAsJSON;
prototype._invPathSetsAsJSONG = inv.invPathSetsAsJSONG;
prototype._invPathSetsAsPathMap = inv.invPathSetsAsPathMap;
prototype._invPathSetsAsValues = inv.invPathSetsAsValues;

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = get.setCache;

module.exports = falcor;

