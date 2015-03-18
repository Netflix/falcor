var falcor = require('./src');
var alternateGet = require('./alt_src');
var prototype = falcor.Model.prototype;
prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = null;
prototype._getPathsAsValues = alternateGet.getAsValues;
prototype._getPathsAsJSON = alternateGet.getAsJSON;
prototype._getPathsAsPathMap = alternateGet.getAsPathMap;
prototype._getPathsAsJSONG = alternateGet.getAsJSONG;
prototype._getPathMapsAsValues = alternateGet.getAsValues;
prototype._getPathMapsAsJSON = alternateGet.getAsJSON;
prototype._getPathMapsAsPathMap = alternateGet.getAsPathMap;
prototype._getPathMapsAsJSONG = alternateGet.getAsJSONG;
prototype._setPathMapsAsValues = alternateGet.setPathMapsAsValues;

module.exports = falcor;

