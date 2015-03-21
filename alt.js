var falcor = require('./src');
var alternativeGet = require('./operations/alt');
var prototype = falcor.Model.prototype;
prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = null;
prototype._getPathSetsAsValues = alternativeGet.getAsValues;
prototype._getPathSetsAsJSON = alternativeGet.getAsJSON;
prototype._getPathSetsAsPathMap = alternativeGet.getAsPathMap;
prototype._getPathSetsAsJSONG = alternativeGet.getAsJSONG;
prototype._getPathMapsAsValues = alternativeGet.getAsValues;
prototype._getPathMapsAsJSON = alternativeGet.getAsJSON;
prototype._getPathMapsAsPathMap = alternativeGet.getAsPathMap;
prototype._getPathMapsAsJSONG = alternativeGet.getAsJSONG;
// prototype._setPathMapsAsValues = alternativeGet.setPathMapsAsValues;
prototype._setCache = alternativeGet.setCache;

module.exports = falcor;

