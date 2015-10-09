var sinon = require('sinon');
var expect = require('chai').expect;
var noOp = function() {};
var falcor = require('./../../lib');
var Model = falcor.Model;
var strip = require("./../cleanData").stripDerefAndVersionKeys;

module.exports = function() {
    require("./pathMaps");
    require("./pathSets");
};
