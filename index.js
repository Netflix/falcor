var falcor = require('./src');
var alternateGet = require('./operations/alt');
var prototype = falcor.Model.prototype;
prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = null;
prototype._getPathSetsAsValues = alternateGet.getAsValues;
prototype._getPathSetsAsJSON = alternateGet.getAsJSON;
prototype._getPathSetsAsPathMap = alternateGet.getAsPathMap;
prototype._getPathSetsAsJSONG = alternateGet.getAsJSONG;
prototype._getPathMapsAsValues = alternateGet.getAsValues;
prototype._getPathMapsAsJSON = alternateGet.getAsJSON;
prototype._getPathMapsAsPathMap = alternateGet.getAsPathMap;
prototype._getPathMapsAsJSONG = alternateGet.getAsJSONG;
prototype._setPathMapsAsValues = alternateGet.setPathMapsAsValues;

module.exports = falcor;

