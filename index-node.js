var falcor = require('./src');
var prototype = falcor.Model.prototype;

prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = null;
prototype._getPathSetsAsJSON = require("./lib/operations/get-pathsets-json-dense");
prototype._getPathSetsAsJSONG = require("./lib/operations/get-pathsets-json-graph");
prototype._getPathSetsAsPathMap = require("./lib/operations/get-pathsets-json-sparse");
prototype._getPathSetsAsValues = require("./lib/operations/get-pathsets-json-values");

prototype._setPathSetsAsJSON = require("./lib/operations/set-pathsets-json-dense");
prototype._setPathSetsAsJSONG = require("./lib/operations/set-pathsets-json-graph");
prototype._setPathSetsAsPathMap = require("./lib/operations/set-pathsets-json-sparse");
prototype._setPathSetsAsValues = require("./lib/operations/set-pathsets-json-values");

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = require("./operations/alt-sentinel/legacy_setCache");

module.exports = falcor;
