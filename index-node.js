var falcor = require('./src');
var alternativeGet = require('operations');
var prototype = falcor.Model.prototype;
prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = null;
prototype._getPathSetsAsValues = alternativeGet.getPathSetsAsValues;
prototype._getPathSetsAsJSON = alternativeGet.getPathSetsAsJSON;
prototype._getPathSetsAsPathMap = alternativeGet.getPathSetsAsPathMap;
prototype._getPathSetsAsJSONG = alternativeGet.getPathSetsAsJSONG;
prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");

module.exports = falcor;
