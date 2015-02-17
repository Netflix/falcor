var ErrorDataSource = require("../../data/ErrorDataSource");
var jsong = require("../../../bin/Falcor");
var Model = jsong.Model;
var chai = require("chai");
var expect = chai.expect;
var testRunner = require("../../testRunner");

describe("DataSource", function() {
    it("should get a hard error from the DataSource.", function(done) {
        var model = testRunner.getModel(new ErrorDataSource(503, "Timeout"));
        model.
            get(["test", {to: 5}, "summary"]).
            toPathValues().
            subscribe(function() {}, function(err) {
                expect(err.length).to.equal(6);
                var expected = {
                    path: [],
                    value: {
                        status: 503,
                        message: "Timeout"
                    }
                };
                err.forEach(function(e, i) {
                    expected.path = ["test", i, "summary"];
                    testRunner.compare(expected, e);
                });
                done();
            }, function() {
                done("Should not finish with completed");
            });
    });
    
    it("should get a hard error from the DataSource with some data found in the cache.", function(done) {
        var model = testRunner.getModel(new ErrorDataSource(503, "Timeout"), {
            test: {
                0: {
                    summary: "in cache"
                },
                5: {
                    summary: "in cache"
                }
            }
        });
        var count = 0;
        model.
            get(["test", {to: 5}, "summary"]).
            toPathValues().
            subscribe(function(x) {
                var expected = {
                    path: ["test", count === 0 ? 0 : 5, "summary"],
                    value: "in cache"
                };
                count++;
                testRunner.compare(expected, x);
            }, function(err) {
                debugger;
                expect(err.length).to.equal(4);
                var expected = {
                    path: [],
                    value: {
                        status: 503,
                        message: "Timeout"
                    }
                };
                err.forEach(function(e, i) {
                    expected.path = ["test", i + 1, "summary"];
                    testRunner.compare(expected, e);
                });
                done();
            }, function() {
                done("Should not finish with completed");
            });
    });
});
