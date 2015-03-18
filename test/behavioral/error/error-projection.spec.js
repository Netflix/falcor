var jsong = require("../../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var RCache = require("../../data/ReducedCache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var getModel = testRunner.getModel;

describe("Projection", function() {
    var query = ["videos", "errorBranch", "summary"];
    var expected = Values().errorBranchSummary;
    describe.only("should capture the error through the errorSelector - Local Cache.", function(done) {
        ["toJSON", "toValues"].forEach(function(format) {
            test(getModel.bind(null, undefined, Cache()), expected, query, format);
        });
    });
    
    // no need to test every case since its the same logic, this is just a gate to ensure all is working.
    xdescribe("should capture the error through the errorSelector - From DataSource.", function(done) {
        test(getModel.bind(null, undefined, {}), expected, query, "toJSONG");
    });
});

function test(getModel, expected, query, format) {
    it(format, function(done) {
        expected = expected["As" + format.slice(2)].errors[0];
        var newExpected = [
            {path: expected.path, value: {"$size": 51, "$type": "error", "message": "new message"}},
            {path: expected.path, value: {"$size": 51, "$type": "error", "message": "new message"}},
        ];
        var errorFormatIndex = Number(Boolean(~format.indexOf("toJSONG")));
        var calledSelector = false;
        getModel(
            function(path, error) {
                // testRunner.compare(expected.path, path);
                // testRunner.compare(expected.value, error);
                calledSelector = true;
                return {
                    "$size": 51,
                    "$type": "error",
                    "message": "new message"
                };
            }).
            get(query)[format === "toValues" ? "toPathValues" : format]().
            doAction(function() {}, function(err) {
                testRunner.compare(newExpected.slice(errorFormatIndex, errorFormatIndex + 1), err);
                testRunner.compare(calledSelector, true);
            }).
            subscribe(function() {
            }, function() {
                done();
            }, function() {
                done("Done without erroring");
            });
    });
}
