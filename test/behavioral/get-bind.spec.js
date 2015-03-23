var jsong = require("../../index");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../data/LocalDataSource");
var Cache = require("../data/Cache");
var RCache = require("../data/ReducedCache");
var Expected = require("../data/expected");
var getTestRunner = require("../getTestRunner");
var testRunner = require("../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};

describe("Bind", function() {
    require("./bind/bind-error-and-short-circuit.spec");
    require("./bind/bind-cases.spec");
});
