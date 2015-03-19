var falcor = require('./src');
var sentinelGet = require('./operations/alt-sentinel');
var prototype = falcor.Model.prototype;
prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = null;
prototype._getPathSetsAsValues = sentinelGet.getAsValues;
prototype._getPathSetsAsJSON = sentinelGet.getAsJSON;
prototype._getPathSetsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathSetsAsJSONG = sentinelGet.getAsJSONG;
prototype._getPathMapsAsValues = sentinelGet.getAsValues;
prototype._getPathMapsAsJSON = sentinelGet.getAsJSON;
prototype._getPathMapsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathMapsAsJSONG = sentinelGet.getAsJSONG;
prototype._setPathMapsAsValues = sentinelGet.setPathMapsAsValues;

module.exports = falcor;
